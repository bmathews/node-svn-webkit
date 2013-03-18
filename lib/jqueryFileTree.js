// jQuery File Tree Plugin
//
// Version 1.01
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 24 March 2008
//
// Visit http://abeautifulsite.net/notebook.php?article=58 for more information
//
// Usage: $('.fileTreeDemo').fileTree( options, callback )
//
// Options:  root           - root folder to display; default = /
//           script         - location of the serverside AJAX file to use; default = jqueryFileTree.php
//           folderEvent    - event to trigger expand/collapse; default = click
//           expandSpeed    - default = 500 (ms); use -1 for no animation
//           collapseSpeed  - default = 500 (ms); use -1 for no animation
//           expandEasing   - easing function to use on expand (optional)
//           collapseEasing - easing function to use on collapse (optional)
//           multiFolder    - whether or not to limit the browser to one subfolder at a time
//           loadMessage    - Message to display while initial tree loads (can be HTML)
//
// History:
//
// 1.01 - updated to work with foreign characters in directory/file names (12 April 2008)
// 1.00 - released (24 March 2008)
//
// TERMS OF USE
// 
// This plugin is dual-licensed under the GNU General Public License and the MIT License and
// is copyright 2008 A Beautiful Site, LLC. 
//

var fs = require('fs');

if(jQuery) (function($){
	
	$.extend($.fn, {
		fileTree: function(o, h) {
			// Defaults
			if( !o ) var o = {};
			if( o.root == undefined ) o.root = '/';
			if( o.folderEvent == undefined ) o.folderEvent = 'click';
			if( o.expandSpeed == undefined ) o.expandSpeed= 500;
			if( o.collapseSpeed == undefined ) o.collapseSpeed= 500;
			if( o.expandEasing == undefined ) o.expandEasing = null;
			if( o.collapseEasing == undefined ) o.collapseEasing = null;
			if( o.multiFolder == undefined ) o.multiFolder = true;
			if( o.loadMessage == undefined ) o.loadMessage = 'Loading...';
			
			$(this).each( function() {

                // var data = '<ul class="jqueryFileTree" style="display: none;"><li class="directory collapsed"><a href="#" rel="../../demo/demo/images/photos/">photos</a></li><li class="file ext_gif"><a href="#" rel="../../demo/demo/images/battletoads.gif">battletoads.gif</a></li><li class="file ext_png"><a href="#" rel="../../demo/demo/images/box.png">box.png</a></li><li class="file ext_png"><a href="#" rel="../../demo/demo/images/drop-shadow.png">drop-shadow.png</a></li><li class="file ext_gif"><a href="#" rel="../../demo/demo/images/left_arrow.gif">left_arrow.gif</a></li><li class="file ext_png"><a href="#" rel="../../demo/demo/images/my_image.png">my_image.png</a></li><li class="file ext_gif"><a href="#" rel="../../demo/demo/images/right_arrow.gif">right_arrow.gif</a></li></ul>';

                function getData(dir, cb) {
                    var html = $('<ul class="jqueryFileTree" style="display: none;">');
                    fs.readdir(dir, function (err, files) {
                        files.forEach(function (file) {
                            var stat = fs.statSync(dir + file);
                            if (stat.isDirectory()) {
                                html.append('<li class="directory collapsed"><a href="#" rel="' + dir + file + '/">' + file + '</a></li>');
                            } else {
                                html.append('<li class="file collapsed"><a href="#" rel="' + dir + file + '">' + file + '</a></li>');
                            }
                        });
                        cb(html);

                    });
                }

				function showTree(c, t) {
					$(c).addClass('wait');
					$(".jqueryFileTree.start").remove();
                    getData(t, function (data) {
                         $(c).find('.start').html('');
                         $(c).removeClass('wait').append(data);
                         if( o.root == t ) $(c).find('UL:hidden').show(); else $(c).find('UL:hidden').slideDown({ duration: o.expandSpeed, easing: o.expandEasing });
                         bindTree(c);
                     });
				}

				function bindTree(t) {
					$(t).find('LI A').bind(o.folderEvent, function() {
						if( $(this).parent().hasClass('directory') ) {
							if( $(this).parent().hasClass('collapsed') ) {
								// Expand
								if( !o.multiFolder ) {
									$(this).parent().parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
									$(this).parent().parent().find('LI.directory').removeClass('expanded').addClass('collapsed');
								}
								$(this).parent().find('UL').remove(); // cleanup
								showTree( $(this).parent(), $(this).attr('rel').match( /.*\// )[0]);
								$(this).parent().removeClass('collapsed').addClass('expanded');
							} else {
								// Collapse
								$(this).parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
								$(this).parent().removeClass('expanded').addClass('collapsed');
							}
						} else {
							h($(this).attr('rel'));
						}
						return false;
					});
					// Prevent A from triggering the # on non-click events
					if( o.folderEvent.toLowerCase != 'click' ) $(t).find('LI A').bind('click', function() { return false; });
				}
				// Loading message
				$(this).html('<ul class="jqueryFileTree start"><li class="wait">' + o.loadMessage + '<li></ul>');
				// Get the initial file list
				showTree( $(this), o.root );
			});
		}
	});
	
})(jQuery);