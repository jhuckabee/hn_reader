$(function() {
  var itemTemplateSource = $("#item-template").html(),
      itemTemplate = Handlebars.compile(itemTemplateSource),
      itemList = $('#items'),
      refreshIcon = $('#refresh-icon');

  var HN = {

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
      HN.iframeLoadBegin();
      var div = $(e.currentTarget);
      $('.selected').removeClass('selected');
      div.addClass('selected');
      e.preventDefault();
      $('#itemContent').attr('src', div.find("h2 a").attr('href'));
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
