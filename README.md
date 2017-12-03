<img src="http://www.noblic.com/img/arques/arqueslogo.png" width="200"/>
============<br>
By Andy Remi (andy@noblic.com)<br>
Version 1.0<br>
<br>
Copyrightⓒ Noblic, Inc. All rights reserved.<br>
Since 2016<br> 
>License: <a target="newnew" href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a><br>
You are free to share, adapt for any purpose, even commercially.<br>
You must give appropriate credit, link to the license, indicate if changes were made.<br>

------
  
## Introduction
  
Arques engine is designed and coded based on the philosophy of simplism. Arques aims to take mathematical simplicity. Many ideas of Arques have come from the great works of jQuery, AngularJS, Mustache and Animate.css. So Arques has many similar patterns to them. But Arques has no dependencies. You don't need jQuery, AngularJS nor Mustache when you use Arques. You don't need to include even Animate.css. Arques is containing it. So call it by &lt;script src="arques.js"&gt; and just use it. That's it. 
And you can still use the other 3rd party frameworks like jQuery without any collision. Beside, Arques Engine supports NodeJS too!
<br>

## Samples

For veterans, I believe you'd better see just the sample codes without explanation. Since Arques is intuitive, it's very easy to understand and it will save your time. You can go straight to the sample list.

- <h4><a href="https://www.noblic.com/arques/samples/" target="newnew">Samples</a></h4>
<br>

## Description

### < Concept > 

Readability is one of the most important part of programming.
Usually too long identifiers make the readability bad.
Complex architecture or a lot of reserved words in frameworks will make us crazy and it throws us into typing hell and communication hell.
Instead, if we remember some short abbreviations and promise to use it,
then everybody could be convenient and happy as well as we could reduce typing effort and coding time. 
Arques has been developed based on the philosphy. For example, you can get the window width with 'ar' singleton like below:

	<script src="https://www.noblic.com/js/arques.js"></script>
	<script>	
	var w = ar.w; // returns current window width
	var h = ar.h; // returns current window height
	</script>

<b>ar</b> is a global singleton. <b>w</b> property has been used to get the width of a window on the above code for our convenience.  It's like that usually <b>x</b> is a horizontal axis in mathematics.
How about getting a DOM element? 
	
	E('myId')
	E('#myId')
	
<b>E</b> is a global function like <b>$</b> of jQuery. It's an abbreviation of <b>ArquesElement</b> but don't try to use <b>ArquesElement</b> directly, instead, use just <b>E</b>. You can do everything what you want with <b>E</b> and it's the reason why <b>ArquesElement</b> has intentionally such a long name opposing Arques philosophy. And you don't need to use <b>#</b> with <b>E</b> for your convenience.
Arques will find it automatically.<br>
Now do you want to find a child in an element?
	
	var child = E('parent-id').E('child-id')
	
How about positioning?

	var a = E('myId');
	a.x = 100; 
	a.y = 150; 
	
	// Now 'myId' element will be moved to (100px, 150px). 

Too easy? Yes. It's extremely simple. Arques recognizes the changes of propertis. So you can make it animated very easily like this.

	setInterval(function() {
	  a.x += 1;
	}, 30);
	
You can simplify it more by Arques style.

	ar.loop(function() { // ar.loop calls the function at intervals of 20 milliseconds
	  a.x += 1;
	  return a.x < 300; // loops until false
	});
	
And you can use <b>ar.run</b> instead of setTimeout like this:
 
	ar.run(500, function() { // the function will be called after 500ms
	  a.x = 100;
	});
		
Arques accesses the style property of the DOM element internally. Do you want to get the current position of element or want to set its width?
	
	var x = a.x;
	var y = a.y; 
	a.w = 100; // width is now 100px

How about proportion?

	a.x = '100%'; // it works!

Also this is possible.

	a.x = 'calc(100% - 50px)'; // yeah!
	
Try to compare with jQuery and AngularJS.

	//
	// Arques
	//

	var a = E('myId');	
	a.x = 100;
	a.y = 100;
	
	//
	// jQuery
	//
	
	var a = $('#myId');
	a.css('left', 100);
	a.css('top', 100);
	
	//
	// AngularJS 
	//

	<div style="{{functionThatReturnsStyle()}}"></div>
	
	angular.module('myApp', []).controller('MyCtrl', function($scope) {
	  ...
	  $scope.functionThatReturnsStyle = function() {
	    var style = "left:100px;top:100px";
	    return style;
	  };
	});

Arques is not only more simple, but also it's more intuitive and improves the readability. And finally the productivity of your project will be improved much more.
<br>
<br>
### < Selecting >

There are some ways to select DOM element.

	var a = E('myId'); // by id
	var a = E('.myClass'); // by class name
	var a = E('div'); // select all div in html document

And you can access a DOM element like an array when ArquesElement contains multiple DOM objects.

	var a = E('div');
	a[0].style.left = '100px'; // a[0] is DOM element
	a[1].style.backgroundColor = 'red'; // a[1] is DOM element too

This is easier way.

	E(a[0]).x = 100; // you can wrap DOM element with E()
	E(a[0]).bc = 'red'; // 'bc' property is abbreviation of 'backgroundColor'
<br>
<br>
### < 'inited' Callback >

<b>ar.scope</b> is a global Scope object which manages intermediate variabls for binding, repeating, and events. You can bind your Javascript variable to an html element through a Scope object. 

Scope object also gets global events which are generated by Arques Engine. For example, 'inited' event will occur when Arques Engine compiled the document completely. So you can get the event as below:

	ar.scope.on('inited', function() { 
		...
	});

Every ArquesElement defined before 'inited' event is meaningless. It means that you have to define your ArquesElement in 'inited' event handler as below:

	ar.scope.on('inited', function() { 
		var myDiv = E('myDiv');
	});
	
More formally, you'd better do as below:

	var app = {}; 
		
	ar.scope.on('inited', function() { 
		app.myDiv = E('myDiv');
	});
<br>

### < 'size' Callback >

'size' event is also broadcasted by Arques when the window size is changed.

	ar.scope.on('size', function() { 
		... refresh something ...
	});
<br>

### < Including >

	<script src="https://www.noblic.com/js/arques.js"></script>
	
	[+sample/header.html] <!-- This line will be replaced by sample/header.html -->
	[+sample/content.html] <!-- This line will be replaced by sample/content.html -->
	[+sample/footer.html] <!-- This line will be replaced by sample/footer.html -->
	
	<script>
	  ar.setDomain('https://www.noblic.com'); // specify the default server domain
	  // Now Arques Engine will include that files after this document is loaded completely
	</script>

As you can see, including is also easy. Set the default server domain with <b>ar.setDomain</b> method and just use <b>[+path]</b> pattern. Now you don't need to copy and paste the common codes!<br>
(* Including works with the server side only because of the cross origin issue.)
<br>
<br>
Template is also available for the including feature.

	<script src="https://www.noblic.com/js/arques.js"></script>
	
	[+sample/content2.html 
	  abc:def <!-- all 'abc' in header.html will be replaced by 'def' -->
	  %msg%:"wow" <!-- and all '%msg%' will be replaced by '"wow"' -->
	]
	
	<!-- % is not a special character. It's considered as a normal character. -->
	<!-- * Javascript in the template html is not compiled or executed. It's just ignored. -->
	
	<script>
	  ar.setDomain('https://www.noblic.com'); // specify the default server domain
	</script>

Use <b>[+path src:dst src:dst ...]</b> pattern for the template feature. <b>src:dst</b> must be distinguished by at least one space.
<br>
<br>
### < Text Binding & Multilingual System >

Bind text by using <b>{{@id}}</b> pattern.<br>
(! loading a language file works with the server side only because of the cross origin issue.)<br>
You can load a language file with <b>ar.setLang</b> as below:

	<script src="https://www.noblic.com/js/arques.js"></script>
	
	<div>{{@greeting}}</div><!-- {{@greeting}} will be replaced by 'Hello' -->
	
	<script>
	  // ar.setLang(langCode, langFileUrl);
	  ar.setDomain('https://www.noblic.com'); // specify the default server domain
	  ar.setLang('en', '/sample/en.js'); // Arques Engine will load the language file when the document is being compiled
	</script>

<b>en.js</b> is like below:

	ar.lang.add('en', { // use ar.lang.add method to register a string set of the language
		greeting: 'Hello World',
	});

Now you might want to add a user name in greeting text as below:

	<script src="https://www.noblic.com/js/arques.js"></script>
	
	<div>
	  {{@greeting 
	    %name%:userName 
	    
	   }}
	</div>
	
	<!--
		  %name% will be replaced by scope.userName.
		  If scope.userName is undefined then it's replaced by just 'userName' text as it is.
		-->
	
	<script>
	  // ar.setLang(langCode, langFileUrl);
	  ar.setDomain('https://www.noblic.com'); // specify the default server domain
	  ar.setLang('ko', 'sample/ko.js');
	  
	  ar.scope.on('inited', function() {
		  ar.scope.userName = 'Andy';
	  });
	</script>


<b>ko.js</b> is like below:

	ar.lang.add('ko', { // use ar.lang.add method to register a string set of the language
		greeting : "안녕 %name%"
	});

Use <b>{{@textId src:dst src:dst ...}}</b> pattern to replace text-id by real text in smart way.
Using the text binding for the placeholer attribute is also available as below:

	<input id="name" type="text" placeholder="{{@loginName}}" value="">

It's easy and intuitive! You might want to do this too:

	<input id="name" type="text" placeholder="{{@greeting  %name%:userName}}" value="">

Save your time with Arques and enjoy coffee in your free time!
<br>
<br>
### < Data Binding >

Bind variable by using <b>{{:variableName}}</b> pattern. 

	<script src="https://www.noblic.com/js/arques.js"></script>
	
	<div>{{:name}}</div>  <!-- {{:name}} will be replaced by 'Napoléon Bonaparte' -->
	
	<script>
	ar.scope.on('inited', function() {
	  ar.scope.name = 'Napoléon Bonaparte'; // Binding!
	  	
	  setTimeout(function() {
	    ar.scope.name = 'Arques Engine'; // Change it after 2 seconds!
	  }, 2000);
	});
	</script>

As you can see, the binding feature works in the scope range. You can define a variable name freely in the Scope object. Structure is also available as below:

	<script src="https://www.noblic.com/js/arques.js"></script>
	
	<div>{{:myCategory.name}}</div>
	
	<script>
	ar.scope.myCategory = {}; // must be defined before initialization

	ar.scope.on('inited', function() {
	  ar.scope.myCategory.name = 'Arques in my category!'; 
	  	
	  setTimeout(function() {
	    ar.scope.myCategory.name = 'Arques Engine in my category!'; 
	  }, 2000);
	});	
	</script>

And image source could be bound dynamically.

	<pic src="{{myCategory.pic}}" style="width:100px;"/>

Use 'pic' tag instead of 'img' to prevent preloading by html engine. Arques changes 'pic' to 'img' in compile time.
<br>
<br>
### < Repeating >

AngularJS style repeating is available, but Arques is pretty different as below:

	<script src="https://www.noblic.com/js/arques.js"></script>
	
	<div repeat id="customer_list">     <!-- 'repeat' keyword was used! -->
	  {{name}}                          <!-- {{id}} pattern is for just replacing not binding -->
	</div>
	 
	<script>
	ar.scope.on('inited', function() {
	  var repeat = scope.repeat('customer_list');  // getting Repeat object to manage the block
	  repeat.add({  // Just add data. Then a new block will be appeared on the screen!
		 name: 'Andy',
	  });
	});
	</script>

A reserved word <b>repeat</b> was used to specify that the div block is for repeating. <b>scope.repeat</b> returns a <b>Repeat</b> object by specifying its <b>id</b>. Now you can add your data with <b>Repeat.add</b> method and then a real div block will be appeared. The <b>repeat</b> keyword makes the div block a template.<br>
<br>
Data binding is possible too as below:

	<script src="https://www.noblic.com/js/arques.js"></script>
	
	<div repeat id="customer_list">         
	  {{:name}}                    <!-- {{:id}} pattern is used for data binding -->
	</div>
	 
	<script>
	ar.scope.on('inited', function() {
		var repeat = scope.repeat('customer_list'); 
		var customer = {           
		  name: 'Andy',
		};
		
		repeat.add(customer);
		
		setTimeout(function() {
		  customer.name = 'Andy Remi'; // Change it!
		}, 2000);
	});
	</script>

As you can guess, a repeat block will be appeared on the screen and the <b>name</b> field will be set as 'Andy' at first. And it will be replaced by 'Andy Remi' after 2 seconds.<br>
<br>
Structure is also possible.

	<script src="https://www.noblic.com/js/arques.js"></script>
	
	<div repeat id="customer_list">
	  {{:person.name}}
	</div>
	 
	<script>	
	ar.scope.on('inited', function() {
	  var repeat = scope.repeat('customer_list');

	  var data = {
	    person: {
	      name: 'Andy'
	    }
	  };
		
	  repeat.add(data);
	});
	</script> 

However Arques only supports leaf level binding, so don't try to change parent data structure like 'data.person = { name: "Jane" }' at once. Intead, use <b>repeat.update(index, data)</b> method as below:

	<script src="https://www.noblic.com/js/arques.js"></script>
	
	<div repeat id="customer_list">
	  {{:person.name}}
	</div>
	 
	<script>
	ar.scope.on('inited', function() {
		var repeat = scope.repeat('customer_list');
		
		var data = {
		  person: {
		    name: 'Andy'
		  }
		};
			
		repeat.add(data);
		    
		var newData = { 
		   person: {
		     name: 'Jane'
		   }
		}
			    
		repeat.update(0, newData);
	});
	</script> 

You can add more data. And the data could be retrieved from the server side as below:

	<script src="https://www.noblic.com/js/arques.js"></script>
	
	<div repeat id="customer_list">
	  <div style="width:200px;float:left;">
	    {{:person.name}}
	  </div>
	  <div style="width:200px;float:left;">
	    {{:person.job}}
	  </div>
	  <div style="clear:both;"></div>
	</div>
		 
	<script>
	ar.setDomain('https://www.noblic.com'); // specify the default server domain
	ar.scope.on('inited', function() {
		var repeat = scope.repeat('customer_list');
		var sub_url = '/customer_list';
		var params = {
		  page: 0
		};
		
		// ar.net.get retrieves data from server by GET method
	
		ar.net.get(sub_url, params, function(isSucc, data) { 
		  for (var i in data)
		    repeat.add(data[i]); // customer list will be appeared on the screen!
		});
	});
	</script> 

<b>repeat-sub</b> resevered word specifies that only children will be repeated not its outerHTML. In the below example, two &lt;div&gt; children of 'customer_list' will be repeated.

	<script src="https://www.noblic.com/js/arques.js"></script>
	
	<div repeat-sub id="customer_list">
	  <div style="width:200px;float:left;">
	    {{:person.name}}
	  </div>
	  <div style="width:200px;float:left;">
	    {{:person.job}}
	  </div>
	  <div style="clear:both;"></div>
	</div>
		 
	<script>
	ar.setDomain('https://www.noblic.com'); // specify the default server domain
	ar.scope.on('inited', function() {
		var repeat = scope.repeat('customer_list');
		
		var sub_url = '/customer_list';
		var params = {
		  page: 0
		};
		
		// ar.net.get retrieves data from server by GET method
	
		ar.net.get(sub_url, params, function(isSucc, data) { 
		  for (var i in data)
		    repeat.add(data[i]); // customer list will be appeared on the screen!
		});
	});
	</script> 

You can access to each row like repeat.<b>list[0]</b>, repeat.<b>list[1]</b>, ... and so on. One list item has <b>data</b> and <b>items</b> properties. <b>data</b> is the data you specified by <b>repeat.add</b>, <b>repeat.update</b>, or <b>repeat.insert</b>. <b>items</b> is a E(DOM object) array of one row. So in the above example, repeat.<b>list[0].items[0]</b> is the first <b>&lt;div&gt;</b> block of the first row, and repeat.<b>list[0].items[1]</b> is the second <b>&lt;div&gt;</b> block of the first row.<br>

<b>repeat-sub</b> also repeats table's row but table is handled in pretty different way. Always <b>&lt;tr&gt;</b> block will be inserted whather you specified or not.

	<script src="https://www.noblic.com/js/arques.js"></script>
	<style>
	/* https://www.tablesgenerator.com/html_tables */
	.tg  {border-collapse:collapse;border-spacing:0;}
	.tg td{font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;}
	.tg th{font-family:Arial, sans-serif;font-size:14px;font-weight:normal;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;}
	.tg .tg-yw4l{vertical-align:top}
	</style>
		
	<table repeat-sub id="customer_list" class="tg">
	  <td class="tg-yw4l>
	    {{:person.name}}
	  </td>
	  <td class="tg-yw4l>
	    {{:person.job}}
	  </td>
	</table>
	 
	<script>
	ar.setDomain('https://www.noblic.com'); // specify the default server domain
	ar.scope.on('inited', function() {
		var repeat = scope.repeat('customer_list');
		
		var sub_url = '/customer_list';
		var params = {
		  page: 0
		};
		
		// ar.net.get retrieves data from server by GET method
	
		ar.net.get(sub_url, params, function(isSucc, data) { 
		  for (var i in data)
		    repeat.add(data[i]); // customer list will be appeared on the screen!
		});
	});
	</script> 

So in the above example, repeat.<b>list[0].items[0]</b> is <b>&lt;tr&gt;</b> block not <b>&lt;td&gt;</b> block and <b>&lt;td&gt;</b> blocks are children of the <b>&lt;tr&gt;</b> block.<br>
Please refer to <b>RepeatBlock</b> class for more information.
<br>
<br>
### < Preference & Cookie >

<b>ar.pref</b> has convenient methods to handle cookie and it could be used for user preference. Basic usage is like below:

	<script src="https://www.noblic.com/js/arques.js"></script>

	<script>
	ar.scope.on('inited', function() {
		var key = 'name';
		var val = 'Andy';
		
		ar.pref.set(key, val);
		ar.pref.get(key); // returns 'Andy'
	});
	</script>

! <b>ar.pref</b> works with the server side only because of the cross origin issue.

Additionally you can use special type methods as below:

	<script src="https://www.noblic.com/js/arques.js"></script>
	<script>
	ar.scope.on('inited', function() {
		var key = 'name';
		var val = 'Andy';
		
		ar.pref.set(key, val);
		ar.pref.getInt(key); // returns 0
		ar.pref.getStr(key); // returns 'Andy'
		ar.pref.getFloat(key); // returns 0
		ar.pref.del(key); // remove 'name' field
		ar.pref.getStr(key); // returns undefined
	});
	</script>
	
Once you set a value for a key, you will be able to get it again after refresh the browser.
<br>
<br>
### < Embedded Icons >

<b>Arques.js</b> is containing embedded vector icons and you can use it very easily <b>without including any additional js or css file</b>. The icons came from Google Material Icons(<a target="iconlist" href="https://www.noblic.com/arques/samples/icons.html">https://www.noblic.com/arques/samples/icons.html</a>). You can choose what you want in the list.

	<script src="https://www.noblic.com/js/arques.js"></script>
	
	<icon shape="refresh" size="80"></icon>
	 
	<script>
		// no script is needed for icon
	</script>

Just use <b>icon</b> tag and specify the size. Use <b>fill</b> style to specify the color as below:

	<script src="https://www.noblic.com/js/arques.js"></script>
	
	<icon shape="refresh" size="20" style="fill:red;" />
	 
	<script>
		// no script is needed for icon
	</script>

You can add an icon dynamically as below:

	<script src="https://www.noblic.com/js/arques.js"></script>

	<div id="myId"></div>
	 
	<script>
	ar.scope.on('inited', function() {
	  	var div = E('myId');
	  	var newIcon = ar.icon('battery_90'); 
	  	div.html = newIcon;
	});
	</script>
	
<b>ar.icon(name, size, style)</b> has been used. Size and Style are omittable. Size is number and style is the value of the style field like 'fill:red'. Here is another example:

	<script src="https://www.noblic.com/js/arques.js"></script>
	
	<icon id="myIcon" shape="refresh" size="20" style="fill:red;margin-top:3px;" />
	 
	<script>
	ar.scope.on('inited', function() {
	  	var icon = E('myIcon');
	  	
	  	setTimeout(function() {
	  	  ar.setIcon(icon, 'battery_50', 50, 'fill:blue;');
		}, 2000);
	});
	</script>
<br>
### < Abbreviation >

Arques has many abbreviated properties for convenience. You can get or set the properties.<br>
<b>Tip</b>: You'd better print this example to familiarize. It's very easy to remember though.<br>
       Try to remind the first character of abbreviation group. For example, <b>margin</b> group is <b>m</b> and <b>padding</b> group is <b>p</b>.<br>
       But some groups(visibility, hierarchy, ...) are not abbreviated becuase the traditional way is more intuitive in that case.

	var a = E('myId'); // now a is ArquesElement
	
	///////////////////////////
	// Positioning 
	// * Element must be 'absolute position' for this feature
	// * Basicially Arques uses pixel coordinate system
	//
	
	a.x = 10; // sets the x coordinate to 10 pixels
	a.y = 20; // sets the y coordinate to 20 pixels
	a.z = 50; // sets zIndex to 50
	a.w = 100; // sets the width to 100 pixels
	a.h = 200; // sets the height to 200 pixels
	
	a.l = 50; // left (same with a.x)
	a.t = 10; // top (same with a.y)
	a.r = 100; // right (when you set right, x or l property is set to right - width + 1 automatically)
	a.b = 200; // bottom (when you set bottom, y or t property is set to bottom - height + 1 automatically)

	a.frame = R(x, y, w, h); // changes all at once. R is abbreviated function returning json structure of rectangle
	a.frame = RR(l, t, r, b); // changes all at once. RR is abbreviated function returning json structure of rectangle
	
	a.minw = 30; // min width
	a.maxw = 60; // max width
	a.minh = 20; // min heiht
	a.maxh = 40; // max height
	
	
	///////////////////////////
	// Transforming
	// * Arques handles all element as 3d object 
	// * Transforming will be applied to local coordinate system only
	//
	
	ar.setAngleUnit(unit); 
	// sets global default unit. unit can be ar.RADIAN or ar.DEGREE
	// applied to all element
	
	a.angleUnit = ar.RADIAN; 
	// sets default unit for 'a' only. unit can be ar.RADIAN or ar.DEGREE
	
	// value unit could be degree or radian. default is degree
	a.spin = 45; // rotates 45 degrees on the x, y, z axis
	a.spinX = 30; // rotates 30 degrees on the x axis
	a.spinY = 60; // rotates 60 degrees on the y axis
	a.spinZ = 90; // rotates 90 degrees on the z axis
	
	a.scale = 2; // scales up to double on the x, y, z axis
	a.scaleX = 3; // scales up to 3 times on the x axis
	a.scaleY = 0.5; // scales down to half on the y axis
	a.scaleZ = 10; // scales up to 10 times on the z axis
	
	// value unit could be degree or radian. default is degree
	a.skew = 45; // skews 45 degrees on the x, y axis // * skewZ is not suppported yet 
	a.skewX = 30; // skews 30 degrees on the x axis 
	a.skewY = 60; // skews 60 degrees on the y axis 
	
	a.flipX = true; // flips on the x axis
	a.flipY = true; // flips on the y axis
	a.flipZ = true; // flips on the z axis
	
	a.tx = 20; // translates 20 pixels on the x axis
	a.ty = -10; // translates -10 pixels on the y axis
	a.tz = 100; // translates 100 pixels on the z axis
	
	
	///////////////////////////
	// Margin & Padding
	//
	
	a.margin = '10 20 30 40'; // sets margin of top, right, bottom, left (starts from top and turns clockwise)
	a.ml = 20; // sets margin left to 20 pixels
	a.mt = 30; // sets margin top to 30 pixels
	a.mr = 40; // sets margin right to 40 pixels
	a.mb = 50; // sets margin bottom to 50 pixels
	
	a.padding = '10 20 30 40'; // sets pading of top, right, bottom, left (starts from top and turns clockwise)
	a.pl = 20; // sets margin left to 20 pixels
	a.pt = 30; // sets margin top to 30 pixels
	a.pr = 40; // sets margin right to 40 pixels
	a.pb = 50; // sets margin bottom to 50 pixels
	
	
	///////////////////////////
	// Scrolling & Offset
	//
	
	a.sl = 10; // sets scrollLeft to 10 pixels
	a.st = 20; // sets scrollTop to 10 pixels
	a.sw = 100; // sets scrollWidth to 100 pixels
	a.sh = 200; // sets scrollWidth to 200 pixels
	a.se(); // scroll to end vertically
	a.se(true); // scroll to end horizontally
	
	a.ow = 200; // sets offsetWidth to 200 pixels
	a.oh = 100; // sets offsetHeight to 100 pixels
	
	
	///////////////////////////
	// Overflow
	//
	
	a.overflow = 'scroll'; // sets overflow to 'scroll'
	a.ox = 'visible'; // sets overflow-x to 'visible'
	a.oy = 'hidden'; // sets overflow-y to 'hidden'
	
	
	///////////////////////////
	// Visibility
	//
	
	a.display = 'none'; // sets display to 'none'
	a.visible = 'false'; // sets visibility to 'hidden'
	a.show(); // sets display to 'block' and visibility to 'visible'
	a.hide(); // sets display to 'none'
	a.isShowing(); // returns if it's shown (return display != 'none' && visible == 'visible')
	
	
	///////////////////////////
	// Background
	//
	
	a.background = 'url(test.jpg) repeat-y'; // sets background
	a.bi = 'url(/img/icon.png)'; // sets backgroundImage
	a.bs = '100% 50%'; // sets backgroundSize
	a.bc = 'red'; // sets backgroundColor
	
	
	///////////////////////////
	// Transparentness
	//
	
	a.alpha = 0.5; // sets opacity to 0.5
	
	
	///////////////////////////
	// Font
	//
	
	a.fc = 'red'; // sets font color to 'red'
	a.fs = 20; // sets font size to 20
	a.ff = 'arial'; // sets font family to 'arial'
	
	
	///////////////////////////
	// Cursor
	//
	
	a.cursor = 'pointer'; // sets cursor to 'pointer'
	
	
	///////////////////////////
	// Class
	//
	
	a.cls = 'class1 class2'; // set class to 'class1 class2'
	a.addCls('class3'); // add 'class3'
	a.delCls('class2'); // delete 'class2'
	
	
	///////////////////////////
	// Value
	//
	
	a.html = '<table><td>hello</td></table>'; // sets innerHTML
	a.html += '<p>Cool!</p>'; // add html
	a.val = 10; // sets value to 10 (used with input, textarea, ...)
	
	//
	// Enable / Disable
	//
	
	a.disable(); // ignores all event (for Arques centralized events only) 
	a.enable(); // gets all event (for Arques centralized events only) 
	a.isEnabled(); 
	
	
	///////////////////////////
	// Attribute
	//
	
	a.attr('src', '/img/logo.png'); // sets key & value
	
	
	///////////////////////////
	// Event System
	// 
	
	ar.EV_DN // This is set automatically as mousedown in desktop browser or touchstart in mobile browser
	ar.EV_MV // This is set automatically as mousemove in desktop browser or touchmove in mobile browser
	ar.EV_UP // This is set automatically as mouseup in desktop browser or touchend in mobile browser
	ar.EV_CN // This is set automatically as mouseout in desktop browser or touchcancel in mobile browser
	
	// Below codes use Arques centralized event controller for performance

	var onDn = function(e) { ... }
	a.on(ar.EV_DN, onDn); // sets onmousedown event handler

	var onMv = function(e) { ... }
	a.on(ar.EV_MV, onMv); // sets onmousemove event handler

	var onUp = function(e) { ... }
	a.on(ar.EV_UP, onUp); // sets onmouseup event handler

	var onCn = function(e) { ... }
	a.on(ar.EV_CN, onCn); // sets onmouseout event handler

	// Below codes uses native event handler (just by giving true flag)

	var onDn = function(e) { ... }
	a.on(ar.EV_DN, onDn, true); // sets onmousedown event handler

	var onMv = function(e) { ... }
	a.on(ar.EV_MV, onMv, true); // sets onmousemove event handler

	var onUp = function(e) { ... }
	a.on(ar.EV_UP, onUp, true); // sets onmouseup event handler

	var onCn = function(e) { ... }
	a.on(ar.EV_CN, onCn, true); // sets onmouseout event handler

	// function parameter must be given to unset the event handler	
	a.off(ar.EV_DN, onDn);
	a.off(ar.EV_MV, onMv);
	a.off(ar.EV_UP, onUp);
	a.off(ar.EV_CN, onCn);
	
	// for the native events
	
	a.off(ar.EV_DN, onDn, true);
	a.off(ar.EV_MV, onMv, true);
	a.off(ar.EV_UP, onUp, true);
	a.off(ar.EV_CN, onCn, true);
	
	
	///////////////////////////
	// Hierarchy 
	//
	
	a.parent = b; // sets parent node to b
	a.children = arquesElementArray; // replace all children
	
	//
	
	var children = a.children; // children property returns array
	
	for (var i in children) {
		var child = children[i]; // chlid is ArquesElement
		chlid.bc = 'blue'; // sets background color to 'blue'
	}
	
	//
	
	var child = a.E('childId'); // finds child and returns its ArquesElement
	
	//
	
	var a = E('id1');
	var b = E('id2');

	a.add(b); // add b as a child
	a.del(b); // delete child b
	a.insert(1, b); // insert child b at index 1
	
	///////////////////////////
	// Destruction
	// 
	
	a.free(); 
	
	// 'a' will be detached from parent and its all events will be released, 
	// also 'a' will be deleted from memeory

You can see graphical/animation samples at here about the above methods:

<a href="https://www.noblic.com/arques/samples/" target="newnew">Samples</a>
<br>
<br>
### < Singletons >

Arques has many singletons as below for your convenience.

<br><b>ar</b><br>
global namespace including core utils<br>

	ar.log('Simple is better.') 
	// print a log
	
	ar.log(object) 
	// print object by using JSON.stringify
	
	ar.logCS() 
	// print the call stack until this line
	
	ar.setDomain(domain)
	// sets default domain	
	// ex)
	// ar.setDomain('https://www.noblic.com');		
	ar.html(opt)
	// loads an html document from the server
	// the server domain must be set by ar.setDomain(domain) before calling this method
	// opt is json structure
	// ex)
	// var opt = { 
	//	  scope : myScope,  // scope
	//	  url : relativeUrl, // specify relative url like '/mypage'
	//	  cb : function(div) { ... } 
	//          // callback is called when loading and compiling is finished. 
	//          // div is the compiled ArquesElement
	// };
	

	ar.run(delay, func) 
	// simplified version of setTimout. ex) ar.run(500, function() { ... })
	
	ar.loop(callback) 
	// calls callback function at intervals of 20 milliseconds 
	// and continues until callback returns false 
	// useful method for custom animation
	
	ar.ani(opt) 
	// runs animation
	// opt is json structure
	// ex)
	// var opt = { 
	//    obj: E_or_DOM, // object is E or DOM 
	//    name: 'fadeIn', // animation name defined in animated.css 
	//    cb: function() { ... } // callback is called after the animation is finished
	// };	  
		

	ar.setLang(langCode, langFileUrl) 
	// prepare to load a language string set from the specifed url and sets the language code.
	// language file is like below:
	// ar.lang.add('en', { // use ar.lang.add method to register a string set of the language
	// 	  greeting: 'Hello',
	// });
	
	ar.str(id) 
	// Returns a string of specifed id for the current language

	
	ar.on(E_or_DOM, name, handler) 
	// installs an event handler to the centralized event controller
	// (not for native event handler)
	
	ar.off(E_or_DOM, name) 
	// uninstalls an event handler to the centralized event controller
	// (not for native event handler)	
	// ex)
	// ar.on(myDiv, ar.EV_DN, function(e) { ... }); // for onmousedown or ontouchstart
	// ar.off(myDiv, ar.EV_DN);
	
	ar.click(scope, E_or_DOM, opt); 
	// installs a click event
	// cb must be specified as a callback function 
	// or opt['click'] must be specified as a string.
	// ex)
	// ar.click(myScope, myDiv, { cb: function() { ...}, ... }); 
	// ar.click(myScope, myDiv, { 'click': 'onClick()' }); 
	// // myScope.onClick() will be called when click event occurs on myDiv 

	ar.tick() 
	// returns the number of milliseconds since midnight of January 1, 1970
	
	ar.copy(object) 
	// copies an object by JSON.parse(JSON.stringify(o))
	
	ar.setIcon(E_or_DOM_of_icon_tag, shape, size, style); 
	// sets the embedded icon to an icon tag element
	// size and style is omittable
	// ex)
	// var icon = E('myIcon'); // myIcon must be <icon id="myIcon" ...></icon>
	// ar.setIcon(icon, 'battery_90', 50, 'fill:yellow');
	// please refer to https://www.noblic.com/arques/samples/icons.html for the icon names

	ar.isPrefix(string, prefix) // is string not null and having the prefix?
	ar.isSuffix(string, suffix) // is string not null and having the suffix?
	ar.isValid(object) // is object defined and not null?
	ar.isCordova()
	ar.isNodeJS()
	ar.isMobile()
	ar.isMobileWeb()
	ar.isPC()
	ar.isAndroid()
	ar.isAndroidOld()
	ar.isIos()
	ar.isWin()
	ar.isIpad()
	ar.isTablet()
	ar.isFunc()
	ar.isPortrait()
	
	ar.w
	// returns the current width of window 
	
	ar.h
	// returns the current height of window 

	ar.evPos(e)
	// returns event position { x, y }
	// e is a mouse event object or a touch event object
	
	ar.evPoses(e)
	// returns event position array [{ x, y }, { x, y }, ...]
	// e is a mouse event object or a touch event object

	ar.localPos(E_or_DOM, e) 
	// returns local { x, y } of the event (mouse or touch) on E_or_DOM
	// e is a mouse event object or a touch event object


	ar.osVer() 
	// returns OS version
	
	ar.pad(num, size) 
	// 
	ar.pad(3, 5) 
	// returns '00003'. ar.pad(num, size). Fills 0 as many as the size
	
	ar.cmpVer('1.0.5', '1.0.3') // returns 2
	// ar.cmpVer(src, dst) 
	// compares version string of A and B 
	// 0 is identical and the other number is the difference    
	// String length must be same otherwise it returns the difference of the length
   
	ar.urlToHash(url) 
	// parses url parameters and returns a hash structure
	
	ar.strWidth(text, textClass, textStyle) 
	// returns pixel width of specified text. textClass and textStyle could be omitted
	
	ar.strHeight(text, textClass, textStyle) 
	// returns pixel height of specified text. textClass and textStyle could be omitted
	
	ar.uuid() 
	// returns a new uuid
	
	ar.rand(min, max)
	// returns a random integer number between min and max
	
	ar.ymdHms(isUserReadable) 
	// returns the current time by format of YMDHMS. isHumanReadable is omittable
	
	ar.toHex(number) 
	// returns converted hex string (without '0x' prefix)
	
<br><b>ar.net</b><br>
network utils<br>
		
	ar.net.html(url, cb)
	// retrieves html page by GET method
	// 	url is relative url of the default domain
	// cb is called with full html text
	// ex)
	// ar.setDomain('https://www.noblic.com');
	// ar.net.html('/board/list', function(html) { ... });  // html is null when error occurs
	
	ar.net.get(query, params, cb)
	// query json data by GET method
	// query is relative url of the default domain
	// params is json structure having url parameters
	// the server must give a json string
	// cb is called with the result
	// ex)
	// ar.setDomain('https://www.noblic.com');
	// ar.net.get('/customer.list', 
	//            { page: 1 }, 
	//            function(isSucc, json) { ... });
	//             /* isSucc is true when the query is successful 
	//                json is the json structure of the result */
	
	ar.net.post(query, params, cb)
	// query json data by POST method
	// rest of thing is same with ar.net.get
	
	ar.net.upload(opt)
	// uploads files to server
	// opt is json structure
	// ex)
	// ar.setDomain('https://www.noblic.com');
	// ar.net.upload({
	// 	  url: '/customer.picture', // relative url of the default domain
	//	  params: [{ key1: val1 }, { key2: val2 }, ... ], // query parameters array
	//   files: [ path1, path2, ... ], // local file path string array specified by 'input' tag
	//   onProgress: function(oEvent) { ... }, // omittable
	//      /* please refer to 
	//         https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest */
	//   onError: function(evt) { ... }, // omittable
	//   onCancel: function(evt) { ... }, // omittable
	//   onDone: function(isSucc, json) { ... }, // omittable
	//           /* isSucc is true when the query is successful 
	//              json is the json structure of the result */
	// });

<br><b>ar.dlg</b><br>
dialogs like alert, confirm and so on<br>

	ar.dlg.alert(opt) 
	// shows alert dialog
	// opt is json structure
	// ex)
	// var opt = { 
	//	  title : 'This is title', 
	//	  msg : 'This is message',
	//	  cb: function() { ... } // callback. omittable
	// };
	
	ar.dlg.confirm(opt)
	// shows confirm dialog
	// opt is json structure
	// ex)
	// var opt = { 
	//	  title : 'This is title', 
	//	  msg : 'This is message',
	//	  cb: function(isYes) { ... } // callback. omittable
	//        /* isYes = 1 when user clicks yes */
	// };

	ar.dlg.toast(opt)
	// shows toast dialog and hides after delay time
	// opt is json structure
	// ex)
	// var opt = { 
	//	  msg : 'This is message',
	// 	  delay: 2000, // 2000ms. omittable. default is 1000ms
	//	  cb: function() { ... } // callback. omittable 
	// };
	
	ar.dlg.select(opt)
	// shows select dialog 
	// opt is json structure
	// ex)
	// var opt = { 
	//	  title : 'This is title',
	//	  list: itemList, // string arra y
	//	  cb: function(index) { ... } // callback. omittable 
	//      /* index is the index of selected item. 
	//         index = -1 when cancel is clicked. 
	//         if cb function returns false, the select dialig will not disappear
	//      */
	// };
	
	ar.dlg.wait.show(opt)
	// shows waiting dialog
	// opt is json structure and omittable
	// ex)
	// var opt = { 
	//	  cb: function(index) { ... } // callback 
	// };
	
	ar.dlg.wait.hide(opt)
	// hides waiting dialog
	// opt is json structure and omittable
	// ex)
	// var opt = { 
	//	  cb: function(index) { ... } // callback 
	// };
	
	
<br><b>ar.pref</b><br>
preferences utils (using cookies or db)<br>

	ar.pref.set(key, val) // sets key = val to cookie
	ar.pref.get(key) // returns raw
	ar.pref.getInt(key) // returns integer
	ar.pref.getFloat(key) // returns float
	ar.pref.getStr(key) // returns string
	ar.pref.del(key) // deletes key & val
	ar.pref.clear() // clear cookie
	
! preferences utils works with the server side only because of the cross origin issue.

<br><b>ar.valid</b><br>
validation utils for email string, password string and etc<br>

	ar.valid.email(str) // checks if str is valid email
	ar.valid.domain(str) // checks if str is valid domain 
	ar.valid.password(str) // checks if str is valid password 
	  // must be at least 8 characters 
	  // and must have at least one upper alphabet, one lower alphabet, and one number)
	ar.valid.phone(str) // checks if str is valid email
	ar.valid.zip(str) // checks if str is valid email
	ar.valid.uuid(str) // checks if str is valid email


<br><b>ar.icon</b><br>
icon utils. this contains Google Material Design Icons (<a target="iconlist" href="https://www.noblic.com/arques/samples/icons.html">https://www.noblic.com/arques/samples/icons.html)</a><br>

	ar.icon(name, size, style)
	// returns html string of specified icon
	// size and style are omittable
	// ex)
	// ar.icon('radio', 50, 'fill:red'); // returns "<svg ...><path ... /></svg>" of radio icon

<br><b>ar.color</b><br>
color utils<br>

	ar.color(intNum)
	// returns 'rgba(r,g,b,a)' string
	
Please refer to singletons API document for the detail.<br>
<br>
### < To Do >

- Another widgets(draggable, smart gallery including infinite scrolling, graph, effect, ...)<br>
<br>

## Credit

Architecture Designed and Coded by Andy Remi (andy@noblic.com)

Logo Art by Patrice Calligaris (patrice@noblic.com)<br>
<br>
jQuery - <a href="https://jquery.com/">https://jquery.com/</a><br>
<br>
AngularJS - <a href="https://angularjs.org/">https://angularjs.org/</a><br>
<br>
Mustache - <a href="https://mustache.github.io/">https://mustache.github.io/</a><br>
<br>
Animate.css - <a href="https://daneden.github.io/animate.css/">https://daneden.github.io/animate.css/</a><br>
<br>
Google Material Design Icons - <a href="https://www.google.com/design/icons">https://www.google.com/design/icons</a>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
