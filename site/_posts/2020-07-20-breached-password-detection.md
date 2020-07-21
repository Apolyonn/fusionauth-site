---
layout: blog-post
title: Help your users avoid using compromised passwords
description: How can you easily prevent your users from using passwords that have been cracked and made available for sale on the web?
author: Dan Moore
image: blogs/social-sign-in-django/headerimage.png
category: blog
tags: feature-breached-password-detection
excerpt_separator: "<!--more-->"
---

While there are many ways to authenticate against online systems, usernames such as email addresses and passwords are still commonly used credentials. Unfortunately, many passwords have been compromised and made available on the Internet. When combined with the fact that users often reuse passwords across different systems, this means that your application or site may be at risk through no fault of your own.

<!--more-->

## The danger of compromised passwords

Compromised passwords allow unauthorized access to your systems. If a user's credentials are known to another party, that party can access your systems acting as that user. 

Depending on data and functionality available in your systems, the results of unauthorized access could range from worrying to disastrous.

## How to avoid unauthorized access

Here are some common options auth systems provide to help secure user accounts.

* force users to choose hard passwords
* require users to set up two factor authentication
* make users change passwords regularly

What all of these remedies have in common is that they require action by your user. In addition, they don't prevent a user from choosing a complex, shared passwords. 

Defense in depth suggests increasing password security by multiple means, and you can definitely require all of the above. Preventing a user from using a publicly available password, one that has been compromised, is yet another way to increase your system security. There are numerous publicly available databases of cracked passwords. Your auth system can check if a user's password matches anything in these datasets.

Checking for breached passwords has two benefits:

* it helps prevent password reuse across systems. It's not perfect, but if any of the systems have been breached, you can prevent reuse of that credential.
* it's proactive ? https://www.ieee-security.org/TC/SPW2020/ConPro/papers/bhagavatula-conpro20.pdf
* it allows the user to pick whatever password they want, as long as it is unique. Whether that means using a password manager, a string of unique words, or an easily remembered, modified quote. 

Rather than enforcing a certain set of characters in a password, you're disallowing passwords which are problematic. I get frustrated when I'm signing up for an account and get a message like: "you must have between 26 and 31.5 characters in your password, of which exactly 12 must be uppercase and 15 must be numeric and please hop on one foot while entering your password". Okay, maybe I'm exagurating a bit.

If you were going to build this, look for available datasets and consider how to ingest and expose them to your login systems in a performant manner. You can also [look for APIs](https://haveibeenpwned.com/API/v3).

## How FusionAuth can help

*Please note that this is a paid edition feature. You can [learn more about paid editions here](/pricing).*

We have built breached password detection into our auth management system. Enabling realtime compromised password detection and mitigation in FusionAuth couldn't be easier. 

Assuming you've [activated your paid edition with a license key](/docs/v1/tech/reactor), navigate to the Tenant details page, and then to the "Password" tab. Enable "Breached password detection settings" and then choose your options. If you need different configuration for different applications, use the multi-tenant feature to create separate tenants and configure them individually.

{% include _image.liquid src="/assets/img/blogs/breached-password-detection/enable-breached-password-check.png" alt="Enabling breached password detection." class="img-fluid" figure=false %}

This tab is also where you can specify various password settings. The defaults are fine, but feel free to change the rules to meet your needs, whether that is requiring certain types of characters, setting an expiration time, or mandating a given length. Just don't make me hop on one foot, please.

When configuring breached password detection, there are three levels of compromised password matching. You can match:

* on the password alone
* on the password plus username, email address or email sub-address
* on the password and an exact match on username or email address, or commonly used passwords like "password". 

While you know your security requirements, we recommend matching on password alone, as this provides the most protection.

Matching rules apply to all passwords provided whenever a user is created. This includes:

* when they register themselves, should self-registration be enabled
* when they are created via the administrative user interface 
* when a user is created via the [User APIs](/docs/v1/tech/apis/users)

In all cases, a provided password will be checked against a large and ever-growing database of compromised credentials maintained by FusionAuth. In addition, any time a password is changed by a user or adminsitrator, the database will also be checked. 

The other configuration option is what, if any, action to take on user login. Should passwords be checked when someone signs in? One option is not to check for compromised passwords at that time. This is a good choice if you enable breached password detection before you have any production users. In that case, all passwords will have already been vetted during user creation.

Other options include:

* recording the result, which will update statistics and [fire a webhook](/docs/v1/tech/events-webhooks/)
* emailing the user, letting them know their password has been compromised
* forcing the user to change their password

It's important to note that these choices only apply to login events. Password changes and registrations will always require an uncompromised password before they'll succeed.

Enabling this check on login allows you to increase the security of your user accounts in a gradual fashion. It also is likely to lead to a higher success rate, as you'll only be forcing a change when a user is already engaged and trying to sign in.

These settings are also available in the [Tenant API](/docs/v1/tech/apis/tenants), under the `tenant.passwordValidationRules.breachDetection` key. 

### Reporting on affected users

When you enable this feature, you'll also get built in reporting. On a tenant by tenant basis, you can see how many of your users have had breached passwords: 

{% include _image.liquid src="/assets/img/blogs/breached-password-detection/breach-password-report.png" alt="The breached password report." class="img-fluid" figure=false %}

It's also easy to search for users who have compromised credentials from the administrative user interface. This makes it easy to lock accounts, reach out to your customers or take any other actions.

## What does breach detection look like?

Here's an example of a registration API call. Breached password detection has been enabled for the tenant.

```shell
API_KEY=...
APPLICATION_ID=...

curl -XPOST -H 'Content-type: application/json' -H "Authorization: $API_KEY" 'http://localhost:9011/api/user/registration' -d '{"user" : {"email": "dan@piedpiper.com", "password": "password5" }, "registration": {"applicationId" : "'$APPLICATION_ID'" }}'
```

And here is the response:
```json
{"fieldErrors":{"user.password":[{"code":"[breachedCommonPassword]user.password","message":"The [user.password] property value has been breached and may not be used, please select a different password."}]}}
```

Luckily, it's easy to fix. The same curl command with a more secure password allows a registration. I mean, c'mon, "password5"?

If you require password changes when a breached password is found, FusionAuth has built-in pages to support this flow. Here's what a user with a compromised password will see after attempting to login, if you are using the FusionAuth provided login screens:

{% include _image.liquid src="/assets/img/blogs/breached-password-detection/invalid-login-message.png" alt="What a user sees when they are forced to change their breached password." class="img-fluid" figure=false %}

Any administrative user viewing the user details page will also see a warning as well as information about when the breach was found. Here's what it looks like when a user has a weak password:

{% include _image.liquid src="/assets/img/blogs/breached-password-detection/admin-ui-warning-of-breach.png" alt="The warning an administrative user sees after a compromised password is found." class="img-fluid" figure=false %}

## Performance impacts

FusionAuth handles password breach checks in realtime. Any way you slice it, this check is additional work whenever someone registers or, if the login check is configured, signs in. How does that impact performance? 

Here are some benchmarks I created using apache bench. I created 10 users with common poor passwords. Over three runs, with 10000 requests and 100 threads, I made a login request for one of the random users against a local FusionAuth instance. Here are the 50th and 95 percentile durations with the breached password check both disabled and enabled. 

| Run number | Disabled 50th (ms) | Enabled 50th (ms) | 50th % increase | Disabled 95th (ms) | Enabled 95th (ms) | 95th % increase |
|----|---|---|
| 1    | 120 | 123 | 2.5%  | 258 | 274 | 6.2%   |
| 2    | 107 | 115 | 7.5%  | 232 | 285 | 22.8%  |
| 3    | 112 | 104 | -7.1% | 383 | 312 | -18.5% |

You can see some impact on performance, but it fluctuated, and was less than a 20% difference in all cases. Due to the fact I was benchmarking on my local machine, the percentage change is more useful than the actual numbers. You probably won't be deploying your FusionAuth instance on a MacBook, so make sure you test in production.

## Conclusion

Enabling breached password detection is a great strategy to secure your users' data. You can choose how you want to respond and whether you want to check passwords during various parts of the user authentication experience. It also has the benefit of protecting your application and systems from breaches in other companies with little effort on your part, and none of the frustrating rules that stymie user registration.

Just a reminder, this is a paid edition feature only. You can [learn more about paid editions here](/pricing).

TDODO
realtime?
