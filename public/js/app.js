$(function() {
  var itemTemplateSource = $("#item-template").html(),
      itemTemplate = Handlebars.compile(itemTemplateSource),
      itemList = $('#items'),
      refreshIcon = $('#refresh-icon');

  var HN = {

    iframeLoadComplete: function() {
      $('#loadingIndicator').hide();
    },

    iframeLoadBegin: function() {
      $('#loadingIndicator').show();
    },

    loadItems: function() {
      this.loadingItems();
      $.getJSON('/top.json', function(items) {
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
    }

  };

  HN.loadItems();

  $('#refresh').click(function(e) {
    e.preventDefault();
    HN.loadItems();
  });

  $('.item').live('click', function(e) {
    HN.iframeLoadBegin();
    var div = $(e.currentTarget);
    $('.selected').removeClass('selected');
    div.addClass('selected');
    e.preventDefault();
    $('#itemContent').attr('src', div.find("h2 a").attr('href'));
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

  $('.item .site-link a').live('click', function(e) {
    var target = $(e.currentTarget);
    window.location = target.attr('href');
  });

  $('#itemContent').load(function(e) {
    HN.iframeLoadComplete();
  });
});
