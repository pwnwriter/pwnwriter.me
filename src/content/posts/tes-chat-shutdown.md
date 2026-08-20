---
title: "TES.chat: An Experiment in Fixing College Transfers"
description: "How a frustrating college transfer experience became an AI-powered course-equivalency system, and why I eventually took it offline."
pubDate: 2026-08-16
modDate: 2026-08-16
tags: ["opinion"]
---

I did not start `tes.chat` because I wanted to build another AI wrapper.

I started it because transferring colleges was annoying in a very specific way:
everyone tells you credits can transfer, but nobody gives you a clear answer
until you have already done too much work.

You look at one college catalog, then another. You open course descriptions in
different tabs. You compare credits, prefixes, prerequisites, general education
requirements, and old PDFs that may or may not still be true. Then you email
someone, wait, and usually get an answer that still depends on another office.

At some point I remember thinking: this should not be this hard.

Not because transfer evaluation is simple. It is not. But the first layer of the
problem felt very searchable. If a course from school A has already been accepted
as equivalent to a course at school B, why should a student have to dig through
half-broken websites to find that out?

That frustration became `tes.chat`.

## the beginning

The original idea was simple:

> what if you could ask transfer-credit questions in plain English?

Something like:

> "Will my calculus class transfer?"

or:

> "I took these courses at my old college. What could they count for here?"

The answer should not be a generic AI response. It should be grounded in actual
course-equivalency data.

So I started collecting data from transfer-equivalency systems, college pages,
course catalogs, and public information that students already had access to, but
that was painful to search manually. The project eventually covered `180+`
universities and `20k+` courses.

That number was exciting, but also a little scary. The more data I added, the
more obvious it became that this was not just a search problem. Every school has
its own naming style, its own course numbering patterns, and its own way of
describing the same class.

One school says `ENG 101`.

Another says `ENGL 1101`.

Another calls it "College Composition I".

To a student, these might feel like the same thing. To a registrar, they might
not be. That gap is where the project became interesting.

## making it conversational

I did not want `tes.chat` to feel like a database table.

The whole point was that a student should be able to ask a question the way they
would ask a person:

> "I took CS 201 and MATH 151. What are they equivalent to?"

or:

> "Can you read my transcript and tell me what might transfer?"

So I built it around a retrieval flow. The system would search through the
course-equivalency data, pull the most relevant matches, and then use an LLM to
explain the result in normal language.

The important part was grounding. I did not want the model guessing. If there
was no matching record, the answer had to say that clearly. If the data looked
uncertain, it had to say that too.

Eventually I added transcript reading. You could upload or paste transcript-like
text, and the system would try to extract courses, credits, and institutions,
then compare them against the equivalency data.

That felt like the moment where the project became real.

Not polished. Not perfect. But real.

Instead of students manually copying course codes into search boxes, they could
drop in what they had and ask questions around it.

## what worked

The best part was seeing how natural the interface felt.

Course-transfer systems are usually built around forms. Pick a state. Pick a
school. Pick another school. Search a course. Click a row. Open another tab.
Repeat.

`tes.chat` let the flow start from the student's actual question.

That mattered because students usually do not think in database filters. They
think in anxiety:

- "Am I going to lose credits?"
- "Do I have to retake this class?"
- "Will this delay graduation?"
- "Is this course useful, or did I waste money?"

The system was useful because it met that anxiety closer to where it actually
lived.

It also made me appreciate how much work institutions hide behind the word
"transfer." A single equivalency can represent a policy decision, a department
review, accreditation rules, catalog changes, and sometimes just history.

AI did not remove that complexity. It just made the first pass easier to
understand.

## what started breaking down

The same thing that made `tes.chat` useful also made it risky.

Transfer-credit data changes. Course catalogs change. Departments rename
classes. Schools update policies. Some equivalencies expire. Some are
conditional. Some depend on grades, degree programs, residency requirements, or
whether an advisor approves the plan.

A database can be stale.

An AI answer can sound confident.

That combination is dangerous.

Even with disclaimers, I did not like the idea of someone making a real college
decision from an answer that might be missing one policy detail. I could make
the system say "verify with your institution" everywhere, but if the answer was
easy to read and looked official enough, people could still trust it too much.

There was also the maintenance problem. Keeping data accurate across hundreds of
schools is not a small side project. It needs constant updates, source tracking,
quality checks, and ideally relationships with institutions.

I could keep hacking on the product, but I could not honestly say I was keeping
the underlying data as reliable as the use case deserved.

And then there was cost.

Running AI features is not free. Transcript parsing, retrieval, generation,
hosting, storage, monitoring, retries, abuse prevention, all of it adds up. For
a personal project, the bill is one thing. For a tool students might depend on,
the responsibility is another.

I did not want `tes.chat` to become a half-maintained system that looked more
trustworthy than it really was.

So I took it offline.

## why shutdown was the right call

Taking something offline feels worse than never shipping it.

When you never ship, the idea stays clean in your head. When you ship and later
shut it down, there is proof that the idea existed, worked in some ways, and
still was not enough.

But I think that is fine.

`tes.chat` proved the core idea to me:

Students should not have to decode transfer-credit systems alone. They should be
able to ask direct questions and get answers grounded in real institutional
data.

It also proved the hard part:

For something like this, the interface is the easy layer. The difficult part is
trust.

Not UI trust. Real trust.

Where did this equivalency come from? When was it last checked? Does it apply to
this student's program? What happens if two sources disagree? Who is responsible
if the answer is wrong?

Those questions matter more than the chat box.

## what i learned

I learned that AI is very good at making messy systems feel approachable.

That is powerful.

It is also exactly why you have to be careful.

When software summarizes a confusing process, people stop seeing the edges. They
see the answer. If the domain is low-stakes, maybe that is okay. If the domain
affects someone's money, graduation timeline, or immigration status, the bar is
higher.

`tes.chat` was useful, but useful is not the same as ready.

I am still glad I built it. It turned one of my own frustrating experiences into
something practical. It taught me about retrieval, data cleaning, transcript
parsing, and the difference between building a cool demo and operating a tool
people can depend on.

For now, `tes.chat` is offline.

Maybe the idea comes back one day in a better form: with fresher data, clearer
source citations, institutional partnerships, and stronger guardrails.

But the lesson stays the same.

Sometimes the responsible ending for a project is not scaling it.

Sometimes it is shutting it down before it becomes louder than it is correct.
