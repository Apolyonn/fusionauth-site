---
layout: blog-post
title: Like your avatar? You can keep it.
author: Daniel DeGroff
excerpt_separator: "<!--more-->"
categories:
- Products
- Passport
tags:
- code
- gravatar
- java
- avatar
- programming
---
NEED IMAGE keep_avatar.jpg

Did you know that you can now bring your avatar with you when you log into FusionAuth?
<a href="https://en.gravatar.com/">Gravatar</a> provides users with a globally recognized avatar. If you already have a Gravatar account then you need not do anything else, we've taken care of everything. For those without a Gravatar account you'll still see a randomly generated Gravatar. Everyone wins.
<!--more-->

Gravatar simply allow you to take your avatar everywhere you go. You create an account, register one or more email addresses and everywhere you use that email address that also supports Gravatar - boom, your avatar shows up.

Adding Gravatar support in FusionAuth has been on the ToDo list for a while now and I found that I needed something to code on the bus ride home from work. As a result we now have Gravatar support in FusionAuth. Enjoy.

Gravatar has some good integration examples, but if you want a Java snippet, here is a condensed version of what we've added to FusionAuth.

```
public class Gravatar {
  public String getUrl(String email) throws NoSuchAlgorithmException {
    MessageDigest md5 = MessageDigest.getInstance("MD5");
    StringBuilder hash = new StringBuilder();
    for (byte b : md5.digest(email.trim().toLowerCase().getBytes())) {
      hash.append(Integer.toHexString((b &amp; 0xFF) | 0x100).substring(1, 3));
    }
    return "//www.gravatar.com/avatar/" + hash.toString() + "?d=identicon&amp;s=250";
  }
}```
