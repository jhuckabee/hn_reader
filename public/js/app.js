$(function() {
  var itemTemplateSource = $("#item-template").html(),
      itemTemplate = Handlebars.compile(itemTemplateSource),
      itemList = $('#items'),
      refreshIcon = $('#refresh-icon');

  var HN = {

    iframeUnfriendlyHosts: [
      'nytimes.com',
      'twitch.tv',
      'groups.google.com',
      'plus.google.com',
      'flickr.com',
      'market.android.com',
      'bmj.com'
    ],

    frameFriendlyHost: function(href) {
      var ret = true;;
      this.iframeUnfriendlyHosts.forEach(function(v, i) {
        if(href.match(v)) {
          ret = false;
          return;
        }
      });
      return ret;
    },
    
    markFrameUnfriendlyLinks: function() {
      var div, href;
      $('.item').each(function(i, item) {
        div = $(item);
        href = div.find("h2 a").attr('href');
        if(!HN.frameFriendlyHost(href)) {
          div.addClass("frame_unfriendly_host");
        }
      });
    },

    selectedFeed: 'top',

    selectFeed: function(feed) {
      this.selectedFeed = feed;
      this.loadItems();
      $('#itemListToolbar a').removeClass('active');
      $('#'+feed).addClass('active');
    },

    iframeLoadComplete: function() {
      $('#loadingIndicator').hide();
    },

    iframeLoadBegin: function() {
      $('#loadingIndicator').show();
    },

    loadItems: function() {
      this.loadingItems();
      $.getJSON('/'+HN.selectedFeed+'.json', function(items) {
        itemList.html('');
        items.forEach(function(item) {
          itemList.append(itemTemplate(item));
        });
        HN.itemsLoaded();
        HN.markFrameUnfriendlyLinks();
      });
    },

    loadingItems: function() {
      refreshIcon.addClass('disabled');
    },

    itemsLoaded: function() {
      refreshIcon.removeClass('disabled');
    },

    resizeItemsList: function() {
      $('#items').css('height', $(window).height()-30);
    }

  };

  HN.resizeItemsList();
  HN.loadItems();

  $(window).resize(function() {
      HN.resizeItemsList();
  });

  $('#refresh').click(function(e) {
    e.preventDefault();
    HN.loadItems();
  });

  $('#top').click(function(e) {
    e.preventDefault();
    HN.selectFeed('top');
  });

  $('#newest').click(function(e) {
    e.preventDefault();
    HN.selectFeed('newest');
  });

  $('.item').live('click', function(e) {
    // Ignore this event for site link clicks which should open in a new tab
    if(!$(e.target).parent().hasClass('go_to_site')) {
      var div = $(e.currentTarget),
          href = div.find("h2 a").attr('href');

      e.preventDefault();

      HN.iframeLoadBegin();
      $('.selected').removeClass('selected');
      div.addClass('selected');
      if(HN.frameFriendlyHost(href)) {
        $('#itemContent').attr('src', href);
      }
      else {
        $('#itemContent').attr('src', '/frame_unfriendly_host.html');
        setTimeout(function() {
          window.open(href);
        }, 2000);
      }
    }
  });

  $('.item .comments a').live('click', function(e) {
    e.stopPropagation();
    var target = $(e.currentTarget);
    var div = target.parents('div.item');
    $('.selected').removeClass('selected');
    div.addClass('selected');
    $('#itemContent').attr('src', target.attr('href'));
    return false;
  });

  $('#itemContent').load(function(e) {
    HN.iframeLoadComplete();
  });

});
