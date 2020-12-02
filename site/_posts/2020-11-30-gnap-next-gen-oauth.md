---
layout: blog-post
title: GNAP is the next iteration of OAuth
description: What is GNAP and why should you care?
image: blogs/custom-admin-registration-form/manage-custom-user-profile-data-in-th-fusionauth-admin.png
author: Dan Moore
category: blog
excerpt_separator: "<!--more-->"
---

The Grant Negotiation and Authorization Protocol, also known as GNAP, is currently being formulated in an IETF working group. This protocol will not be backward compatible with OAuth 2, yet it well worth paying attention to. 

<!--more-->

This protocol is in the early stages, but you can read the [draft I'm writing about here](https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-02.html). (GNAP, for those who are wondering, should be pronounced 'g-nap', though there was [some discussion](https://mailarchive.ietf.org/arch/msg/txauth/91n-mXRW_hQWMl-0cGx1j6sxHHI/) on the mailing list about the topic.) 

According to the [working group charter](https://datatracker.ietf.org/wg/gnap/about/), this standard will be released in multiple parts beginning in the middle of 2021. Additionally, they very clearly call out that this is not going to be backwards compatible, but it is going to solve very similar problems as OAuth2 and OIDC:

> This group is chartered to develop a fine-grained delegation protocol for authorization, API access, user identifiers, and identity assertions. ... Although the artifacts for this work are not intended or expected to be backwards-compatible with OAuth 2.0 or OpenID Connect, the group will attempt to simplify migrating from OAuth 2.0 and OpenID Connect to the new protocol where possible.

It's important to note that the authors of the specification don't call this next gen OAuth. That's what I refer to it. Names are confusing: others have called it OAuth3, and it grew out of TxAuth and Oauth.xyz. 

However, the specification is properly called the Grant Negotiation and Authorization Protocol.

## What's wrong with OAuth

Why might you care, if you are happy using OAuth2 and OIDC for your standards based authentication needs?  The core OAuth specification, good old [RFC 6749](https://tools.ietf.org/html/rfc6749), was released in 2012 and has some real strengths:

* The spec is widely supported and deployed.
* It can and has been extended to support novel uses, such as the device grant.
* You can build a secure system with delegation of permissiones with no security PhD required.
* It is far easier on clients than other similar protocols such as SAML.

But nothing is perfect. OAuth2 also has some flaws. Some of them include:

* It is tied tightly to redirects and the browser as a client.
* It has archaic developer ergonomics, including plentiful use of form parameters.
* Proof of possession is late to the game: there are several ways to limit tokens to clients that requested them ([DPOP](https://tools.ietf.org/html/draft-ietf-oauth-dpop-02), [MTLS](https://tools.ietf.org/html/rfc8705)), but most tokens are still bearer tokens, with all the risks. 
* Discovery of endpoints is slightly cumbersome. From the RFC: " The means through which the client obtains the location of the authorization endpoint are beyond the scope of this specification, but the location is typically provided in the service documentation."
* The mobile app experience is suboptimal. The BCP for mobile apps, [8252](https://tools.ietf.org/html/rfc8252), indicates that webviews should not be used: "This best current practice requires that native apps MUST NOT use embedded user-agents to perform authorization requests...". This means that your beautiful native app has to open a system browser when it comes time to authenticate. Not the best user experience.

A big issue with OAuth2 is complexity. Here are some of the RFCs that you may need to read as a user of OAuth.

PIC TBD

To be fair, [OAuth 2.1 is addressing some of these issues](/learn/expert-advice/oauth/differences-between-oauth-2-oauth-2-1/), but from my reading of the draft spec and discussion on the mailing list, GNAP aims to address them more fully.

## Things that excite me about GNAP

First, it's worth reiterating that GNAP is changing rapidly. There's a lot of discussion on the [mailing list](https://mailarchive.ietf.org/arch/browse/txauth/) and you can also see changes happening in the [GitHub repo](https://github.com/ietf-wg-gnap/gnap-core-protocol/). It appears that the draft is being edited there. All that is to say that these features may be in, out, or modified if you read this post months after it was posted.

Here's a video explaining more about GNAP. Plus beer gardens!

{% include _youtube-video.liquid youtubeid="n8xAFjzJsTU" %}

Here are some of the parts of GNAP which seem exciting and will help make auth easier to use going forward.

### Distinct roles for the Requesting Party and Resource Owner 

Right now, the resource owner, who can grant delegate access to the protected resources, is assumed to be the person who requested the grant. This is often the case, as when I grant a photo printing service access to my Flickr account. Wait, is it 2012? I meant my Google Photos account. But sometimes the entity requesting permission may be different than the entity which needs to grant permission, the "Resource Owner" or RO. This is called the "Requesting Party" and has the acronym RQ, maybe because RP already is taken by "Relying Party". The RQ drives the "Resource Client", or RC, which could be a browser or some other device.

From the specification:

> The RQ interacts with the RC to indicate a need for resources on behalf of the RO. This could identify the RS the RC needs to call, the resources needed, or the RO that is needed to approve the request. Note that the RO and RQ are often the same entity in practice.

### Multiple access tokens

A client can ask multiple access tokens in one grant request. This would allow you to ask for different levels of access for different resources. This is of course possible now with multiple grant requests, but could be useful in helping clients follow security best practices such as the principle of least privilege.

Here's an example of how that might look, pulled from the draft specification.

```json
{ 
  "resources": {
    "token1": [
      {
        "type": "photo-api",
        "actions": [
          "read",
          "write",
          "dolphin"
        ],
        "locations": [
          "https://server.example.net/",
          "https://resource.local/other"
        ],
        "datatypes": [
          "metadata",
          "images"
        ]
      },
      "dolphin-metadata"
    ],
    "token2": [
      {
        "type": "walrus-access",
        "actions": [
          "foo",
          "bar"
        ],
        "locations": [
          "https://resource.other/"
        ],
        "datatypes": [
          "data",
          "pictures",
          "walrus whiskers"
        ]
      }
    ]
  }
}
```

You can see that the resource requests can be rich JSON objects, such as the `photo-api` resource. They can also be simple strings, as is `dolphin-metadata`.

### Interactions are first class concepts

In GNAP, the client, also known as the RC, declares what kind of interactions it supports. The authorization server, also known as the AS, responds with the type of interaction that it wants the client to use to interact with the resource owner, or RO. This is a great way to provide an extension point for the future, while still supporting older clients.

Some examples of interactions include:

* Redirect: "redirect[ing] to an arbitrary URL"
* App: "launch an application URL"
* Callback: a URL provided by the RC after the AS interaction is finished.
* User code: a short code which can be displayed, similar to the device grant.

There's even support for avoiding interaction between the RC and the RO, which is useful if you have an out of band method for the RC and the RO to communicate.

### Continuation of grant

Grant requests in OAuth2 are typically one and done. If circumstances change, you start a new grant. With GNAP, you get a grant identifier if the authorization server determines that the grant can be continued. That might look something like this:

```json
{
  "continue": {
    "access_token": {
      "value": "80UPRY5NM33OMUKMKSKU",
      "key": true
    },
    "uri": "https://server.example.com/continue",
    "wait": 60
  }
}
```

This lets a client step up or step down access. For example, when a client first interacts with a resource, it might need write access, but later only need read access. With GNAP, if the grant can be continued, the client can revise the grant request to get a token tied to fewer privileges. This again helps ensure that the client only has access that it needs, while doing so in a way that isn't an undue burden on the client. 

In some cases, such as the step down scenario above, the authorization server may not even need to communicate with the resource owner. From the spec:

> ... The RC realizes that it no longer needs "write" access and therefore modifies its ongoing request, here asking for just "read" access instead of both "read" and "write" as before. The AS replaces the previous resources from the first request, allowing the AS to determine if any previously-granted consent already applies. In this case, the AS would likely determine that reducing the breadth of the requested access means that new access tokens can be issued to the RC. The AS would likely revoke previously-issued access tokens that had the greater access rights associated with them.

You can also cancel grants, if the client's needs change. This is done with a call that feels RESTFUL:

> If the RC wishes to cancel an ongoing grant request, it makes an HTTP DELETE request to the continuation URI.

### Keys keys everywhere

Cryptographic keys are built deep into GNAP, and are referenced many times in many parts of grants. Here's an example partial request, again pulled from the draft spec, from a client to which an authorization server might respond:

```json
{
    "client": {
      "display": {
        "name": "My Client Display Name",
        "uri": "https://example.net/client"
      },
      "key": {
        "proof": "jwsd",
        "jwk": {
                    "kty": "RSA",
                    "e": "AQAB",
                    "kid": "xyz-1",
                    "alg": "RS256",
                    "n": "kOB5rR4Jv0GMeL...."
        }
      }
    },
}
```

The `key` value of the `client` object is the public key of the client, in this request JSON. This will be bound to requests, and many [formats are supported](https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-02.html#name-binding-keys). In some cases, this could also have the value `true`, in which case the token in that response is bound to the key of the cliennt. Bearer tokens still work, however. They didn't abandon that construct, which has been so successful in the OAuth2 ecosystem; in that case the `key` value is `false.

> If the key value is the boolean false, the access token is a bearer token sent using the HTTP Header method defined in [RFC6750].

### Identity built in

### Developer ergonomics




## What should you do?

If OAuth2 works for you, keep using it
Authorization Code Grant with PKCE please
People will still be running OAuth2 in 3 years


Keep an eye on the draft. There's a lot more in there that is worth examining.
Check in
Join the mailing list
Contribute if you can
Reference implementations


Review to see if it fits your use cases better
Migration path for major OAuth grants
In draft right now



video




Why GNAP

OAuth2 successful

image ofk


