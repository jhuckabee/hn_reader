/*!
 * Opower Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */
var fs          = require('fs'),
    crypto      = require('crypto'),
    ams         = require('ams'),
    ejs         = require('ejs'),
    compress    = false,
    public_dir  = '',
    css_dir     = '',
    js_dir      = '',
    views_dir   = '',
    JS_HASH     = '',
    CSS_HASH    = '',
    css         = [
                  'style.css'
                ],
    js          = [
                  'jquery-1.6.2.js',
                  'handlebars.js',
                  'app.js'
                ];

function compressAssets() {
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
        js:             'combined.js',
        css:            'combined.css'
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
}

function hashifyAssets() {
  var js, css = '';

  js = fs.readFileSync(public_dir + '/compressed/combined.js', 'utf8')
  JS_HASH = crypto.createHash('md5').update(js).digest("hex");
  fs.writeFileSync(public_dir + '/js/compiled/'+JS_HASH+'.js', js);

  css = fs.readFileSync(public_dir +'/compressed/combined.css', 'utf8')
  CSS_HASH = crypto.createHash('md5').update(css).digest("hex");
  fs.writeFileSync(public_dir + '/css/compiled/'+ CSS_HASH +'.css', css);
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
  var out         = [], 
      jsp         = require('uglify-js').parser,
      pro         = require('uglify-js').uglify,
      cacheBuster = '',
      preloader   = '',
      ast         = '';

  if (compress || options.compress) {
    out.push("'/js/compiled/"+JS_HASH+".js'");
  }
  else {
    js.forEach(function(file) {
      out.push("'/js/" + file + cacheBuster + "'");
    });
  }
  
  // Render the preloader script with all the files
  preloader = ejs.render(fs.readFileSync(views_dir + '/js_preloader.ejs', 'utf8'), {locals: {files: out.join(', ')}});
  
  // Uglify it
  ast = jsp.parse(preloader);
  ast = pro.ast_mangle(ast);
  ast = pro.ast_squeeze(ast);

  // Return the script tag.
  return '<script type="text/javascript">' + pro.gen_code(ast) + '</script>';
}

function icon(imgFile, imgAttrs) {
  var attrs = [], attr;

  // Get source from image file
  attrs.push('src="data:image/png;base64,'+ fs.readFileSync(public_dir + imgFile).toString('base64') + '"');

  // Get remaining attributes from hash
  for(attr in imgAttrs) {
    if(imgAttrs.hasOwnProperty(attr)) {
      attrs.push(attr + '="' + imgAttrs[attr] + '"');
    }
  }

  return '<img ' + attrs.join(' ') + ' />';
}

exports.setup = function(app) {
  views_dir   = app.set('views');
  public_dir  = app.set('public');
  css_dir     = public_dir + '/css/';
  js_dir      = public_dir + '/js/';

  compress = app.set('env') == 'production';

  ams = ams.build.create(public_dir);

  if (compress) {
    compressAssets();
    hashifyAssets();
  }

  app.dynamicHelpers({
    styles: function(req) {
      return styles({compress: ('compress' in req.query)});
    },
    scripts: function(req) {
      return scripts({compress: ('compress' in req.query)});
    },
    icon: function(req) {
      return icon;
    }
  });
};
