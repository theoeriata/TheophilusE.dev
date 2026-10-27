---
title: "Mastering FTC Freight Frenzy: Advanced Robot Programming Techniques"
date: 2022-11-20
tags: [ "Blog", "FTC", "Robot Programming", "OpenCV", "TensorFlow", "Control Theory", "Holonomic Drive", "Mecanum Drive", "Field-Centric Control", "Entity Component System", "Control Hub Optimization", "Vision Pipeline", "FTC Dashboard", "Motion Planning", "Java", "FIRST Tech Challenge", "Robot Architecture"]
author: ["Theophilus Eriata"]
description: "A guide to programming an FTC Freight Frenzy robot, covering drive control, path planning, vision pipelines, ECS architecture, and performance optimization."
summary: "This Control Award submission walks through the software architecture behind our FTC 2021–22 robot. We cover four drive-control schemes, modular control accessors, hardware-level optimizations, an Intelligent Drive Assist built on Road Runner, OpenCV vision pipelines, and an Entity Component System for scalable OpMode composition."
cover:
    image: "FIRST_Horz_RGB.jpg"
    alt: "FIRST Tech Challenge Logo"
    relative: true
editPost:
    URL: "https://github.com/theoeriata/FTC_FreightFrenzy"
    Text: "GitHub Repository"
showToc: true
disableAnchoredHeadings: false
---

## Introduction

This post documents the programming process of an advanced robot for the FTC 2021-2022 (Freight Frenzy) season.

## Drive Control Scheme

Drivers always take a liking to intuitive and easy to learn controls that are able to be mastered without sweating too much. As a result of this, one of the core values that were observed when designing the drive control scheme was that our driver should be able to get comfortable with the drive controls within the first 30 minutes of drive testing. On each iteration of the robot, the basic movement for the robot remained relatively the same, however, operations which were done on Assessors (which includes sensors and utility tools like the intake system) did vary between each iteration of the robot because we wanted to match the controls of the robot to how we perceived the robot should be controlled.

As a policy on our team, we do embrace having multiple options and modes which can be changed when building a release version of our program to ensure that the driver can choose the best drive mode that suits their control scheme. There are currently 4 drive modes which are suited to Holonomic (X) Drives and Mechanism Drives which are listed below;

- **ROBOT_CENTRIC_HOLONOMIC**: This drive mode is the most suitable for all Holonomic and Mechanism Drives because it relies on the raw input values from the gamepad and can easily be added to any robot without any dependencies.
- **ROBOT_CENTRIC_MECANUM**: This drive mode is mode is an alternative to the Robot Centric Drive. Instead of manually taking each individual gamepad actions to determine the net velocity of the robot, we use the idea of the Unit Circle to calculate the desired translation of the robot which is automatically clamped to the robot’s max velocity in any arbitrary direction, given that the x and y components are complimentary to each other. The benefit to this control scheme is that it fixes the imperfect strafing present in the Robot Centric control scheme.
- **FIELD_CENTRIC_GAMEPAD**: This mode of control is quite different from the first two as with this mode, the robot’s translation is decoupled from the robot’s rotation. We assume a local rotation of the robot while translating the robot relative to the world coordinates. This mode of control however, requires that the robot’s gyroscope is enabled. This mode of control is possible by projecting the velocity vector of the robot onto a plane to calculate is components in 3-Dimensional Space.
- **FIELD_CENTRIC_IMU**: This is an extension of the Field Centric Drive which uses the Intelligent Drive Assist (IDA) to calculate the robot’s translation based on a heading offset internally. It is tightly coupled with the Intelligent Drive Assist module which regulates the control velocity of the robot’s wheels.

> By default we use the ROBOT_CENTRIC_MECANUM as it is most suitable in most cases.

## Control Accessors

Control Accessors are modules which allow the robot to perform certain operations which can be manually triggered by the driver or called from the program automatically. Accessors are essentially subsystems which are attached physically or virtually to the robot to enable us programmers to compose an OpMode based on its use case. For instance, the ability to sense which level of the shipping hub to place a block may not be needed in a TeleOp drive mode where the driver is in control of the robot but is required to know which level of the shipping hub to deliver freight during the autonomous period. This form of composition is possible utilizing the concept of an Entity Component System (ECS) which will be covered in this document.

There are two categories in which accessors are placed. One is a static accessor which may or may not be internalized (meaning they are declared and setup during compile time) and an update accessor. Static accessors are the subsystems themselves which are independent of the OpMode and can be added to any class that extends the OpModeBase class. The function of a static accessor is to provide an interface which can be used to manage systems such as camera detection and streaming, Turret and Lift control, Robot Heading Management, Color and Distance Sensors. An update accessor, however, is primarily used as a “read and update” system which is useful in our TeleOp modes where the driver’s input controls the robot’s actions. This is used to update the motor power levels that are sent to the wheels to update robot’s current transform (translation and rotation) in the driver-controlled period. It is also used to update and control modules such as the Intake, Lift, Carousel, and Speed Control systems.

## Hardware and Optimizations

It is important to recognize that the control hub is powerful in its design but is prone to overheating when tasked with operations that are take a lot of processing power. When running the robot through unit tests for long periods of time, we noticed that the control hub overheats when running camera stream and sending telemetry data over to the dashboard as well as running tasks which are rarely needed to run for the duration of the whole program.

We started by manually handling the bulk reading cache on all connected hubs which are recognized as Lynx Modules as a way of saving cycle times. Next, we proceeded to build OpModes that are suited to perform specialized operations, such as a simple autonomous program that parks, one that handles the carousel then park, and a final autonomous program that performs every operation that the robot is capable of. Finally, we wrote our own math library to be able to perform fast math operations.

To be able to optimize system calls further, there are specialized commands that can be ran through subsystems that may be called asynchronously without affecting the main loop of the program. Such commands are embedded in their own modules and do not affect the performance of the subsystems.

## Intelligent Drive Assist (IDA)

The Intelligent Drive Assist (IDA) is a special module that is not a subsystem, but functions like one. It is used mainly in autonomous programs to plan the robot’s path during the autonomous periods, perform robot localization, cruise control, and optimize velocity and acceleration control. To perform some of these tasks that are difficult but not impossible to implement on our own we utilize a library called Road Runner as a dependency. Road Runner is a motion planning library that allows complex path generation and tracking while maintaining velocity and acceleration control. IDA is built on top of this framework to ensure that we harness the capabilities of Road Runner which provides a tested foundation of which we can focus on expansion of the system instead of how to create one from the ground up. IDA supports asynchronous processing and intrinsic parallelization. The term “Intrinsic Parallelization” covers two concepts, one is that IDA by default performs operations on a separate thread when needed. Secondly, it means that IDA can be used on any robot that performs its movement in a Holonomic or Tank manner, whether traditional or not. In any OpMode, IDA presents an Application – Engine relationship, where IDA is the engine, and the OpMode is the application. The application holds one instance of the engine and calls methods to perform operations that are related to the robot’s locomotion and holds references to all added components.

## Vision

The robots vision module is a key subsystem in the autonomous program, and it is used to analyze the field usually to detect objects based on color when using the OpenCV module and the shape when using Tensor Flow through the Vuforia variant. The Vision module is wrapped in a subsystem for easy initialization and integration into any OpMode. This season, we acknowledged the OpenCV module to be better suited to accomplish the vision detection requirements. This is because we only needed a unique color to identify our team’s shipping element which was made easier through our pipeline state tracking system. The currently functional pipelines are listed below.

- **Contour Based Pipeline**: This pipeline uses a method of processing the camera’s image buffer to synthesize any color in the range of the color of our shipping hub element. This is possible utilizing a method that is similar to that of implementing a bloom effect in photoshop, where one would blur and the input image using a method of Gaussian Blur multiple times to get a smooth transition between all color values present in the image and simulate light bleed. We then process this pass to find any contours that match our expected output. The final stage is to use a method of screen space partitioning to determine which quadrant (I, II or III) the contour which describes the bounding shape of detected object lies.
- **Duck Contour Pipeline**: This pipeline is made specifically to be able to detect the yellow duck on the field. It extends the contour pipeline and can be used to detect anything yellow in general.
- **Shipping Element Pipeline**: This pipeline extends the contour-based pipeline and is setup to be able to adapt to any shipping element changes without affecting the base pipeline. It extends the functionality of the base contour pipeline by using a more optimized method of finding which color regions hold ranges that are within the specifications of the Shipping Element and most of all, is less verbose and easier to read.

## Entity Component System (ECS)

The Entity Component System approach is used in high performance applications such as games to be cache friendly on the CPU when performing updates on game objects. By ensuring that all subsystems are considered as components which can be added to OpModes which are considered as the Entity, we are able to create and add any arbitrary component to an Entity and update each individual entity without incurring any performance issues. This is so because when components are being accessed to be updated, they are contiguous (close together) in memory. If we were to go full object oriented instead of data oriented in OpMode composition, the objects are not guaranteed to be close together in memory so the CPU would have to load different stacks to be able to access each object. This architecture is vital to ensure that we can build and rebuild OpModes for this season efficiently and the next to little API rewrites unless they are required. It is worth noting that our ECS implementation is made impure because our components do have update functions as is required.

## Autonomous

The main autonomous goal we aim to achieve is to detect the shipping hub level to which freight would be delivered. This would be scanned during the robot initialization phase to save processing load and set the desired hub level before the robot leaves it’s desired scan position. Next is to maneuver to the Carousel spin the platform to deliver the pre-placed duck. Then the robot makes its way to the shipping hub to place the pre-placed freight at the desired hub level. At this stage, the robot would make its way into the warehouse to park. Then we analyze the total elapsed time since the start of the program to see if the robot is able to cycle picking up a freight and delivering it to the topmost shipping hub level and ﬁnally come to rest in the warehouse.

## Algorithms and Utilities

- **Proportional Integral Derive (PID) Controller**: This is our custom control algorithm implementation that is used to derive correction values when dealing with path stabilization.
- **Fast Math & Extended Math Library**: This is written to ensure fast math operations and advanced algorithms. It implements support for vector, axis angle and other useful mathematics operations. As an extension, support for interpolating and extrapolating curves were also implemented. The library also consists of our own Linear Algebra classes so as not to depend on existing classes provided by the third party libraries.
- **Meep Path Visualizer**: This is used for remote path planning, to be able to give a theoretical estimate of the time required to perform certain autonomous programs and get a theoretical overview of what is possible when drafting autonomous paths.
- **Robot Defines**: This is a class that houses all control data needed for the robot and is reflected using the FTC Dashboard API to be able to live edit variables and enumerations for quick testing.
- **Encoder Utilities**: To better interface with motor encoders and make less calculation repetitions, we created an encoder utility class that takes in a reference to any DcMotorEx object on initialization, which helps us perform actions such as calculating offsets and velocity control for the motors.
- **Tensor Flow**: We use Tensor Flow with the Vuforia Module to perform object detection when need to perform object detection based on the composition of the object, instead of just the color alone. This method uses machine learning to generate the recognition data needed to get matches for our game objects.
- **FTC Dashboard**: We use the FTC Dashboard’s reflection system to setup variables that can be reflected / modified during runtime to allow quick iterations of control logic before hard-writing them before compile time. We also use this module to perform other functions such as trajectory analysis, acceleration profiling and other utilities such as saving the capture data to disk, and running OpModes.
