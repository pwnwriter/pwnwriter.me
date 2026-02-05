---
title: "My talk on owasp 0x03"
pubDate: 2023-04-25T15:32:00-05:00
modDate: 2023-04-25T15:32:00-05:00
cover:
  src: ~/assets/owasp/cover.jpg
  alt: pwnwriter's talk in owasp Kathmandu
tags: ['talks']
---

[OWASP][owasp] is a non-profit open-source foundation focused on application
security. They have local and global [chapters][chapters] around the world
aimed at improving community security. We also have a local chapter called
OWASP Kathmandu, which organizes events to spread awareness within Nepal. I had
the privilege to speak at OWASP Kathmandu 0x03, where I presented my tool,
[Halyxon][haylxon].

If you do not know what haylxon is, simple, it's a tool to take screenshots of webpages
from terminal using chrome's headless feature written in Rust!

You can simply take a screenshot of a webpage as below!

```bash
hxn -b <path/to/chrome/bin> -u https://example.com
```

But wait, you could do that by just opening a browser and pressing some holy keys?

I mean yeah? but what would you do when you have `hundreds` of urls, sub(domains) to take?

## Background

There were already tools like [Eyewitness] and [Gowitness], which I had used,
but they either felt slow or lacked my personal touch. Since I wanted to learn
Rust, it was the perfect time to start a new project, especially since I
already had a basic knowledge of Rust.

### Usages

Haylxon comes with a lot of options now, reading urls from `stdin`, `defining
ports`, `running arbitary javascript` and a lot more.

![][hxn]

You can pass a file containing a list of urls, and define height, width and
even a delayed screenshot is possible.

One of the most interesting usages of this tools is that, you can run it on `github` actions
to take screenshot of your subdomain, zip that out upload to [0x0.st][0x0] or your own instance.

After the talk, I was gifted some cute swag and a letter of appreciation. I
want to thank OWASP for that <3.

<!---Links-->
[owasp]: https://owasp.org
[profile]: /images/owasp/owasp.jpg
[hxn]: ~/assets/owasp/haylxon.png
[chapters]: https://owasp.org/chapters/
[haylxon]: https://github.com/pwnwriter/haylxon
[eyewitness]: https://github.com/RedSiege/EyeWitness
[gowitness]: https://github.com/sensepost/gowitness
[0x0]: https://0x0.st
