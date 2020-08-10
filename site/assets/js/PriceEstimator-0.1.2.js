/*
 * Copyright (c) 2019-2020, Inversoft Inc., All Rights Reserved
 */

'use strict';

var FusionAuth = FusionAuth || {};

FusionAuth.PriceEstimator = function() {
  Prime.Utils.bindAll(this);

  this.priceModel = null;
  new Prime.Ajax.Request(FusionAuth.siteURL + '/ajax/edition-price-model', 'GET')
    .withSuccessHandler(this._handleResponse)
    .withErrorHandler(this._handleResponse)
    .go();

  var communityInput = Prime.Document.queryById('community-monthly-active-users').addEventListener('input', this._handleSliderChange);
  communityInput.domElement.element = communityInput;
  communityInput.domElement.label = Prime.Document.queryFirst('label[for=community-monthly-active-users]');
  communityInput.domElement.amount = communityInput.queryUp('.cost').queryFirst('.amount');
  communityInput.domElement.interval = communityInput.queryUp('.cost').queryFirst('.interval');
  communityInput.domElement.plan = 'COMMUNITY';

  var developerInput = Prime.Document.queryById('developer-monthly-active-users').addEventListener('input', this._handleSliderChange);
  developerInput.domElement.element = developerInput;
  developerInput.domElement.label = Prime.Document.queryFirst('label[for=developer-monthly-active-users]');
  developerInput.domElement.amount = developerInput.queryUp('.cost').queryFirst('.amount');
  developerInput.domElement.interval = developerInput.queryUp('.cost').queryFirst('.interval');
  developerInput.domElement.plan = 'DEVELOPER';

  var premiumInput = Prime.Document.queryById('premium-monthly-active-users').addEventListener('input', this._handleSliderChange);
  premiumInput.domElement.element = premiumInput;
  premiumInput.domElement.label = Prime.Document.queryFirst('label[for=premium-monthly-active-users]');
  premiumInput.domElement.amount = premiumInput.queryUp('.cost').queryFirst('.amount');
  premiumInput.domElement.interval = premiumInput.queryUp('.cost').queryFirst('.interval');
  premiumInput.domElement.plan = 'PREMIUM';

  var enterpriseInput = Prime.Document.queryById('enterprise-monthly-active-users').addEventListener('input', this._handleSliderChange);
  enterpriseInput.domElement.element = enterpriseInput;
  enterpriseInput.domElement.label = Prime.Document.queryFirst('label[for=enterprise-monthly-active-users]');
  enterpriseInput.domElement.amount = enterpriseInput.queryUp('.cost').queryFirst('.amount');
  enterpriseInput.domElement.interval = enterpriseInput.queryUp('.cost').queryFirst('.interval');
  enterpriseInput.domElement.plan = 'ENTERPRISE';
};

FusionAuth.PriceEstimator.constructor = FusionAuth.PriceEstimator;
FusionAuth.PriceEstimator.prototype = {
  _handleSliderChange: function(event) {
    if (this.priceModel === null) {
      return;
    }

    var element = event.currentTarget.element;
    var label = event.currentTarget.label;
    var plan = event.currentTarget.plan;
    var amount = event.currentTarget.amount;
    var interval = event.currentTarget.interval;

    // Set the slider label
    var userCount = element.getValue();
    var userCountDisplay = new Intl.NumberFormat('en').format(userCount)
    if (userCount >= 250000) {
      userCountDisplay += "+";
    }
    label.setHTML(userCountDisplay);

    if (plan !== 'COMMUNITY') {
      var cost;
      if (userCount >= 250000) {
        amount.setHTML('<a href="/contact" style="color: inherit; font-size: 32px">Contact sales</a>');
        interval.hide();
      } else {
        var increments = userCount / 10000;
        var edition = this.priceModel[plan];
        if (increments < 10) {
          cost = edition.BASE.pricePerUnit + (edition.TIER_2.pricePerUnit * (increments - 1));
        } else {
          cost = edition.BASE.pricePerUnit + (edition.TIER_2.pricePerUnit * 9) + (edition.TIER_3.pricePerUnit * (increments - 10));
        }

        amount.setHTML('$' + new Intl.NumberFormat('en').format(cost));
        interval.show();
      }
    }
  },

  _handleResponse: function(xhr) {
    if (xhr.status === 200) {
      this.priceModel = JSON.parse(xhr.responseText).support.tierPricing;
    }
  }
};

Prime.Document.onReady(function() {
  new FusionAuth.PriceEstimator();
});