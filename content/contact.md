---
title: "Contact"
description: "Get in touch with Theophilus Eriata — open to engineering collaboration, research discussions, and professional opportunities."
layout: "contact"
hideMeta: true
---

{{< rawhtml >}}
<div class="form-wrapper">
  <h2 style="font-size:1.1rem;font-weight:700;margin:0 0 20px;color:var(--primary);">Send a Message</h2>
  <form action="https://formsubmit.co/17b3dc57a7a0c7e50a994fc8746be041" method="POST">
    <input type="hidden" name="_captcha" value="false">
    <input type="hidden" name="_next" value="https://theophiluse.xiitechnologies.com/contact">

    <div class="form-group">
      <label for="name">Your Name</label>
      <input id="name" name="Name" type="text" placeholder="Jane Doe" required>
    </div>

    <div class="form-group">
      <label for="email">Your Email</label>
      <input id="email" name="Email" type="email" placeholder="name@example.com" required>
    </div>

    <div class="form-group">
      <label for="subject">Subject</label>
      <input id="subject" name="Subject" type="text" placeholder="Project inquiry, research collaboration, etc.">
    </div>

    <div class="form-group">
      <label for="message">Message</label>
      <textarea id="message" name="Message" placeholder="Tell me about your project or question..." required></textarea>
    </div>

    <button type="submit">Send Message</button>
  </form>
</div>

<script>
  document.querySelector('form').addEventListener('submit', function(e) {
    var email = e.target.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      e.preventDefault();
    }
  });
</script>
{{< /rawhtml >}}
