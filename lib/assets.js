/*!
 * Opower Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */
var compress = false,

    public_dir  = '',
    css_dir     = '',
    js_dir      = '',
    JS_HASH     = '',
    CSS_HASH    = '',

    fs          = require('fs'),
    crypto      = require('crypto'),
    ams         = require('ams'),

    css =       [
                  'style.css'
                ],

    js =        [
                  'handlebars.js',
                  'app.js'
                ];

function compress_everything() {
    css.forEach(function(filename) {
        ams.add(css_dir + filename, css_dir);
    });
    js.forEach(function(filename) {
        ams.add(js_dir + filename, js_dir);
    });

    ams
        .process({
            uglifyjs:       false,
            cssvendor:      false,
            cssdataimg:     false,
            csshost:        false,
            cssabspath:     false,
            cssimport:      false,
            htmlabspath:    false,
            cssmin:         false,
            jstransport:    false,
            texttransport:  false
        })
        .combine({
            js: 'combined.js',
            css: 'combined.css'
        })
        .process({
            uglifyjs:       true,
            cssvendor:      false,
            cssdataimg:     false,
            cssimport:      false,
            cssabspath:     false,
            htmlabspath:    false,
            cssmin:         true,
            jstransport:    false,
            texttransport:  false
        })
        .write(public_dir + '/compressed')
        .end();

  hashifyAssets();
}

function hashifyAssets() {
  fs.readFile(public_dir + '/compressed/combined.js', 'utf8', function(err, js) {
    if (!err) {
      JS_HASH = crypto.createHash('md5').update(js).digest("hex");
      console.log('Writing '+ JS_HASH + '.js');
      fs.writeFile(public_dir + '/js/compiled/'+JS_HASH+'.js', js);
    }
    else {
      console.log(err);
    }
  });

  fs.readFile(public_dir +'/compressed/combined.css', 'utf8', function(err, css) {
    if (!err) {
      CSS_HASH = crypto.createHash('md5').update(css).digest("hex");
      console.log('Writing '+ CSS_HASH + '.css');
      fs.writeFile(public_dir + '/css/compiled/'+ CSS_HASH +'.css', css);
    }
    else {
      console.log(err);
    }
  });
}

function styles(options) {
  if (compress || options.compress) {
    return '<link href="/css/compiled/'+CSS_HASH+'.css" rel="stylesheet" type="text/css"/>';
  }

  var out = [], cacheBuster = ''; //'?' + Math.round(Math.random() * build);
  css.forEach(function(file) {
    out.push('<link href="/css/' + file + cacheBuster + '" rel="stylesheet"  type="text/css"/>');
  });
  return out.join('\n');
}

function scripts(options) {
  if (compress || options.compress) {
    return '<script type="text/javascript" src="/js/compiled/'+JS_HASH+'.js"></script>';
  }

  var out = [], cacheBuster = '';
  js.forEach(function(file) {
    out.push('<script type="text/javascript" src="/js/' + file + cacheBuster + '"></script>');
  });
  return out.join('\n');
}

function addHandler(app) {
  public_dir = app.set('public');
  css_dir = public_dir + '/css/';
  js_dir = public_dir + '/js/';

  compress = app.set('env') == 'production';

  ams = ams.build.create(public_dir);

  if (compress) {
    compress_everything();
  }

  app.dynamicHelpers({
    styles: function(req) {
      return styles({compress: ('compress' in req.query)});
    },
    scripts: function(req) {
      return scripts({compress: ('compress' in req.query)});
    }
  });
}


module.exports.addHandler = addHandler;
