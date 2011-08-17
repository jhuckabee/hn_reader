/*!
 * Opower Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */
var compress = false,

    PUBLIC_DIR  = __dirname.replace(/\/lib$/, '/public'),
    CSS_DIR     = 'public/css/',
    JS_DIR      = 'public/js/',
    JS_HASH     = '',
    CSS_HASH    = '',

    fs          = require('fs'),
    crypto      = require('crypto'),
    ams         = require('ams').build.create(PUBLIC_DIR),

    css =       [
                  'style.css'
                ],

    js =        [
                  'handlebars.js',
                  'app.js'
                ];

function compress_everything() {
    css.forEach(function(filename) {
        ams.add(CSS_DIR + filename, CSS_DIR);
    });
    js.forEach(function(filename) {
        ams.add(JS_DIR + filename, JS_DIR);
    });

    ams
        .process({
            uglifyjs:       false,
            cssvendor:      false,
            cssdataimg:     false,
            csshost:        { host: 'http://hn_reader.joshhuckabee.com'},
            cssabspath:     {host: '..'},
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
        .write(PUBLIC_DIR + '/compressed')
        .end();
  hashifyAssets();
}

function hashifyAssets() {
  fs.readFile(PUBLIC_DIR + '/compressed/combined.js', 'utf8', function(err, js) {
    if (!err) {
      JS_HASH = crypto.createHash('md5').update(js).digest("hex");
      console.log('Writing '+ JS_HASH + '.js');
      fs.writeFile(PUBLIC_DIR + '/js/compiled/'+JS_HASH+'.js', js);
    }
    else {
      console.log(err);
    }
  });

  fs.readFile(PUBLIC_DIR +'/compressed/combined.css', 'utf8', function(err, css) {
    if (!err) {
      CSS_HASH = crypto.createHash('md5').update(css).digest("hex");
      console.log('Writing '+ CSS_HASH + '.css');
      fs.writeFile(PUBLIC_DIR + '/css/compiled/'+ CSS_HASH +'.css', css);
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
  compress = app.set('env') == 'production';

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
