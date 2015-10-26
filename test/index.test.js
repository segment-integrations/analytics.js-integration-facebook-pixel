
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Facebook Ads for Websites', function(){
  var FacebookAdsForWebsites = plugin;
  var facebookAdsForWebsites;
  var analytics;
  var options = {
    pixelId: '216411418569295',
    standardEvents: {
      signup: 0,
      login: 1,
      play: 2,
      'Viewed Name Page': 3,
      'Viewed Category Name Page': 4
    },
    legacyConversionEvents: { 'conversion-event': 1293871928 }
  };

  beforeEach(function(){
    analytics = new Analytics;
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
        .mapping('standardEvents')
        .mapping('legacyConversionEvents'));
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
        analytics.load(facebookAdsForWebsites, done);
      });
    });

    describe('should call #load', function(){.
        analytics.initialize();
        analytics.page();
        analytics.called(facebookAdsForWebsites.load);
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(facebookAdsForWebsites, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#page', function(){
      beforeEach(function(){
        analytics.stub(window.fbq, push)
      });

      it('should not track unnamed pages by default', function(){
        // TODO: test that the integration does not track
        // unnamed pages by default, so `.trackAllPages` option
        // is false by default.
        analytics.page({ url: 'http://localhost:34448/test/' });
        analytics.called(window._fbq.push, ['track', 'PageView']);
      });

      it('should track named pages if enabled', function(){
        facebookAdsForWebsites.options.trackAllPages = true;
        analytics.page();
        // TODO: assert that the api was called properly
        // analytics.called(window.api.logEvent, 'Loaded a Page');
      });

      it('should track named pages by default', function(){
        analytics.page('Name');
        // TODO: assert that the api was called properly
        // analytics.called(window.api.logEvent, 'Viewed Name Page');
      });

      it('should track named pages with a category added', function(){
        analytics.page('Category', 'Name');
        // TODO: assert that the api was called properly
        // analytics.called(window.api.logEvent, 'Viewed Category Name Page');
      });

      it('should track categorized pages by default', function(){
        analytics.page('Category', 'Name');
        // TODO: assert that the api was called properly
        // analytics.called(window.api.logEvent, 'Viewed Category Page');
      });

      it('should not track name or categorized pages if disabled', function(){
        facebookAdsForWebsites.options.trackNamedPages = false;
        facebookAdsForWebsites.options.trackCategorizedPages = false;
        analytics.page('Category', 'Name');
        // TODO: assert that the api was not called
        // analytics.didNotCall(window.api.logEvent);
      });
    });



    describe('#track', function(){
      beforeEach(function(){
        // TODO: stub the integration global api.
        // for example:
        // analytics.stub(window.api, 'logEvent');
      });

      it('should send an event', function(){
        analytics.track('event');
        // TODO: assert that the event is sent.
        // analytics.called(window.api.logEvent, 'event');
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        // TODO: assert that the event is sent.
        // analytics.called(window.api.logEvent, 'event', { property: true });
      });
    });
  });
});
