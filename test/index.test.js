var Analytics = require('analytics.js-core').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var plugin = require('../lib/');

describe('Facebook Conversion Tracking', function() {
  var FacebookAdsForWebsites = plugin;
  var facebookAdsForWebsites;
  var analytics;
  var options = {
    pixelId: '216411418569295',
    standardEvents: {
      signup: 0,
      login: 1,
      'Loaded a Page': 2
    },
    legacyConversionEvents: { 'conversion-event': 1293871928 }
  };

  beforeEach(function(){
    analytics = new Analytics();
    facebookAdsForWebsites = new FacebookAdsForWebsites(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(facebookAdsForWebsites);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    facebookAdsForWebsites.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(FacebookAdsForWebsites, integration('Facebook Ads for Websites')
      .global('fbq')
      .option('pixelId', '')
      .option('currency', 'USD')
      .mapping('legacyConversionEvents')
      .mapping('standardEvents'));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(facebookAdsForWebsites, 'load');
    });

    afterEach(function(){
      facebookAdsForWebsites.reset();
    });

    describe('#initialize', function(){
      it('should call #load', function() {
        analytics.initialize();
        analytics.page();
        analytics.called(facebookAdsForWebsites.load);
      });
    });

    describe('#loaded', function() {
      it('should return `true` if window.fbq inited', function() {
        analytics.initialize();
        analytics.assert(!facebookAdsForWebsites.loaded());
        window._fbq.queue = [];
        window._fbq.push = function() {};
        analytics.assert(facebookAdsForWebsites.loaded());
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(facebookAdsForWebsites, done);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#page', function() {
      beforeEach(function() {
         analytics.stub(window._fbq, push);
      });

      it('should track page views', function(){
        analytics.page({ url: 'http://localhost:34448/test/' });
        analytics.called(window._fbq.push, ['track', 'PageView']);
      });

      it('should track page view with fullname', function() {
        analytics.page('Category', 'Name', { url: 'http://localhost:34448/test/' });
        analytics.called(window._fbq.push, ['track', 5, {
          currency: 'USD',
          value: '0.00'
        }]);
      });
    });

    describe('#track', function() {
      beforeEach(function() {
        analytics.stub(window._fbq, 'push');
      });

      it('should send event if found', function() {
        analytics.track('signup', {});
        analytics.called(window._fbq.push, ['track', 0, {
          currency: 'USD',
          value: '0.00'
        }]);
      });

      it('should send paged event if found', function() {
        analytics.track('Loaded A Page', {});
        analytics.called(window._fbq.push, ['trackCustom', 'Loaded A Page', {}]);
        analytics.called(window._fbq.push, ['track', 2, {
          currency: 'USD',
          value: '0.00'
        }]);
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        analytics.called(window._fbq.push, ['trackCustom', 'event', { property: true }]);
      });

      it('should send ecommerce event - Viewed Product Category', function() {
        analytics.track('Viewed Product Category', {
          id: '507f1f77bcf86cd799439011',
          category: 'cat'
        });
        analytics.called(window._fbq.push, ['track', 'ViewContent', {
          content_ids: ['507f1f77bcf86cd799439011'],
          content_type: 'cat'
        }]);
      });

      it('should send ecommerce event - Viewed Product', function() {
        analytics.track('Viewed Product', {
          id: '507f1f77bcf86cd799439011',
          currency: 'USD',
          value: 0.50,
          quantity: 1,
          price: 24.75,
          name: 'my product',
          category: 'cat 1',
          sku: 'p-298'
        });
        analytics.called(window._fbq.push, ['track', 'ViewContent', {
          content_ids: ['507f1f77bcf86cd799439011'],
          content_type: 'product',
          content_name: 'my product',
          content_category: 'cat 1',
          currency: 'USD',
          value: 0.50
        }]);
      });

      it('should send ecommerce event - Adding to Cart', function() {
        analytics.track('Added Product', {
          id: '507f1f77bcf86cd799439011',
          currency: 'USD',
          value: 0.50,
          quantity: 1,
          price: 24.75,
          name: 'my product',
          category: 'cat 1',
          sku: 'p-298'
        });
        analytics.called(window._fbq.push, ['track', 'AddToCart', {
          content_ids: ['507f1f77bcf86cd799439011'],
          content_type: 'product',
          content_name: 'my product',
          content_category: 'cat 1',
          currency: 'USD',
          value: 0.50
        }]);
      });

      it('should send ecommerce event - Completing an Order', function() {
        analytics.track('Completed Order', {
          products: [
           { id: '507f1f77bcf86cd799439011' },
           { id: '505bd76785ebb509fc183733' }
          ],
          currency: 'USD',
          value: 0.50
      });
      analytics.called(window._fbq.push, ['track', 'Purchase', {
        content_ids: ['507f1f77bcf86cd799439011', '505bd76785ebb509fc183733'],
        content_type: 'product',
        currency: 'USD',
        value: 0.50
      }]);
      });
    });
  });
});