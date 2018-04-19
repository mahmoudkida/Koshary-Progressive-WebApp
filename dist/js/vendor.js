!function(t,e){"function"==typeof define&&define.amd?define(e):"object"==typeof exports?module.exports=e():t.Blazy=e()}(this,function(){function n(t){var e=t._util;e.elements=function(t){for(var e=[],o=(t=t.root.querySelectorAll(t.selector)).length;o--;e.unshift(t[o]));return e}(t.options),e.count=e.elements.length,e.destroyed&&(e.destroyed=!1,t.options.container&&m(t.options.container,function(t){h(t,"scroll",e.validateT)}),h(window,"resize",e.saveViewportOffsetT),h(window,"resize",e.validateT),h(window,"scroll",e.validateT)),r(t)}function r(t){for(var e=t._util,o=0;o<e.count;o++){var n,r=e.elements[o],i=r;n=t.options;var s=i.getBoundingClientRect();n.container&&w&&(i=i.closest(n.containerClass))?n=!!c(i=i.getBoundingClientRect(),b)&&c(s,{top:i.top-n.offset,right:i.right+n.offset,bottom:i.bottom+n.offset,left:i.left-n.offset}):n=c(s,b),(n||p(r,t.options.successClass))&&(t.load(r),e.elements.splice(o,1),e.count--,o--)}0===e.count&&t.destroy()}function c(t,e){return t.right>=e.left&&t.bottom>=e.top&&t.left<=e.right&&t.top<=e.bottom}function s(t,e,n){if(!p(t,n.successClass)&&(e||n.loadInvisible||0<t.offsetWidth&&0<t.offsetHeight))if(e=t.getAttribute(y)||t.getAttribute(n.src)){var o=(e=e.split(n.separator))[g&&1<e.length?1:0],r=t.getAttribute(n.srcset),i="img"===t.nodeName.toLowerCase(),s=(e=t.parentNode)&&"picture"===e.nodeName.toLowerCase();if(i||void 0===t.src){var c=new Image,u=function(){n.error&&n.error(t,"invalid"),d(t,n.errorClass),v(c,"error",u),v(c,"load",a)},a=function(){i?s||f(t,o,r):t.style.backgroundImage='url("'+o+'")',l(t,n),v(c,"load",a),v(c,"error",u)};s&&(c=t,m(e.getElementsByTagName("source"),function(t){var e=n.srcset,o=t.getAttribute(e);o&&(t.setAttribute("srcset",o),t.removeAttribute(e))})),h(c,"error",u),h(c,"load",a),f(c,o,r)}else t.src=o,l(t,n)}else"video"===t.nodeName.toLowerCase()?(m(t.getElementsByTagName("source"),function(t){var e=n.src,o=t.getAttribute(e);o&&(t.setAttribute("src",o),t.removeAttribute(e))}),t.load(),l(t,n)):(n.error&&n.error(t,"missing"),d(t,n.errorClass))}function l(e,t){d(e,t.successClass),t.success&&t.success(e),e.removeAttribute(t.src),e.removeAttribute(t.srcset),m(t.breakpoints,function(t){e.removeAttribute(t.src)})}function f(t,e,o){o&&t.setAttribute("srcset",o),t.src=e}function p(t,e){return-1!==(" "+t.className+" ").indexOf(" "+e+" ")}function d(t,e){p(t,e)||(t.className+=" "+e)}function u(t){b.bottom=(window.innerHeight||document.documentElement.clientHeight)+t,b.right=(window.innerWidth||document.documentElement.clientWidth)+t}function h(t,e,o){t.attachEvent?t.attachEvent&&t.attachEvent("on"+e,o):t.addEventListener(e,o,{capture:!1,passive:!0})}function v(t,e,o){t.detachEvent?t.detachEvent&&t.detachEvent("on"+e,o):t.removeEventListener(e,o,{capture:!1,passive:!0})}function m(t,e){if(t&&e)for(var o=t.length,n=0;n<o&&!1!==e(t[n],n);n++);}function a(e,o,n){var r=0;return function(){var t=+new Date;t-r<o||(r=t,e.apply(n,arguments))}}var y,b,g,w;return function(t){if(!document.querySelectorAll){var i=document.createStyleSheet();document.querySelectorAll=function(t,e,o,n,r){for(r=document.all,e=[],o=(t=t.replace(/\[for\b/gi,"[htmlFor").split(",")).length;o--;){for(i.addRule(t[o],"k:v"),n=r.length;n--;)r[n].currentStyle.k&&e.push(r[n]);i.removeRule(0)}return e}}var e=this,o=e._util={};o.elements=[],o.destroyed=!0,e.options=t||{},e.options.error=e.options.error||!1,e.options.offset=e.options.offset||100,e.options.root=e.options.root||document,e.options.success=e.options.success||!1,e.options.selector=e.options.selector||".b-lazy",e.options.separator=e.options.separator||"|",e.options.containerClass=e.options.container,e.options.container=!!e.options.containerClass&&document.querySelectorAll(e.options.containerClass),e.options.errorClass=e.options.errorClass||"b-error",e.options.breakpoints=e.options.breakpoints||!1,e.options.loadInvisible=e.options.loadInvisible||!1,e.options.successClass=e.options.successClass||"b-loaded",e.options.validateDelay=e.options.validateDelay||25,e.options.saveViewportOffsetDelay=e.options.saveViewportOffsetDelay||50,e.options.srcset=e.options.srcset||"data-srcset",e.options.src=y=e.options.src||"data-src",w=Element.prototype.closest,g=1<window.devicePixelRatio,(b={}).top=0-e.options.offset,b.left=0-e.options.offset,e.revalidate=function(){n(e)},e.load=function(t,e){var o=this.options;void 0===t.length?s(t,e,o):m(t,function(t){s(t,e,o)})},e.destroy=function(){var e=this._util;this.options.container&&m(this.options.container,function(t){v(t,"scroll",e.validateT)}),v(window,"scroll",e.validateT),v(window,"resize",e.validateT),v(window,"resize",e.saveViewportOffsetT),e.count=0,e.elements.length=0,e.destroyed=!0},o.validateT=a(function(){r(e)},e.options.validateDelay,e),o.saveViewportOffsetT=a(function(){u(e.options.offset)},e.options.saveViewportOffsetDelay,e),u(e.options.offset),m(e.options.breakpoints,function(t){if(t.width>=window.screen.width)return y=t.src,!1}),setTimeout(function(){n(e)})}}),function(){function s(o){return new Promise(function(t,e){o.onsuccess=function(){t(o.result)},o.onerror=function(){e(o.error)}})}function i(o,n,r){var i,t=new Promise(function(t,e){s(i=o[n].apply(o,r)).then(t,e)});return t.request=i,t}function t(t,o,e){e.forEach(function(e){Object.defineProperty(t.prototype,e,{get:function(){return this[o][e]},set:function(t){this[o][e]=t}})})}function e(e,o,n,t){t.forEach(function(t){t in n.prototype&&(e.prototype[t]=function(){return i(this[o],t,arguments)})})}function o(e,o,n,t){t.forEach(function(t){t in n.prototype&&(e.prototype[t]=function(){return this[o][t].apply(this[o],arguments)})})}function n(t,n,e,o){o.forEach(function(o){o in e.prototype&&(t.prototype[o]=function(){return t=this[n],(e=i(t,o,arguments)).then(function(t){if(t)return new c(t,e.request)});var t,e})})}function r(t){this._index=t}function c(t,e){this._cursor=t,this._request=e}function u(t){this._store=t}function a(o){this._tx=o,this.complete=new Promise(function(t,e){o.oncomplete=function(){t()},o.onerror=function(){e(o.error)},o.onabort=function(){e(o.error)}})}function l(t,e,o){this._db=t,this.oldVersion=e,this.transaction=new a(o)}function f(t){this._db=t}t(r,"_index",["name","keyPath","multiEntry","unique"]),e(r,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]),n(r,"_index",IDBIndex,["openCursor","openKeyCursor"]),t(c,"_cursor",["direction","key","primaryKey","value"]),e(c,"_cursor",IDBCursor,["update","delete"]),["advance","continue","continuePrimaryKey"].forEach(function(o){o in IDBCursor.prototype&&(c.prototype[o]=function(){var e=this,t=arguments;return Promise.resolve().then(function(){return e._cursor[o].apply(e._cursor,t),s(e._request).then(function(t){if(t)return new c(t,e._request)})})})}),u.prototype.createIndex=function(){return new r(this._store.createIndex.apply(this._store,arguments))},u.prototype.index=function(){return new r(this._store.index.apply(this._store,arguments))},t(u,"_store",["name","keyPath","indexNames","autoIncrement"]),e(u,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getKey","getAllKeys","count"]),n(u,"_store",IDBObjectStore,["openCursor","openKeyCursor"]),o(u,"_store",IDBObjectStore,["deleteIndex"]),a.prototype.objectStore=function(){return new u(this._tx.objectStore.apply(this._tx,arguments))},t(a,"_tx",["objectStoreNames","mode"]),o(a,"_tx",IDBTransaction,["abort"]),l.prototype.createObjectStore=function(){return new u(this._db.createObjectStore.apply(this._db,arguments))},t(l,"_db",["name","version","objectStoreNames"]),o(l,"_db",IDBDatabase,["deleteObjectStore","close"]),f.prototype.transaction=function(){return new a(this._db.transaction.apply(this._db,arguments))},t(f,"_db",["name","version","objectStoreNames"]),o(f,"_db",IDBDatabase,["close"]),["openCursor","openKeyCursor"].forEach(function(i){[u,r].forEach(function(t){t.prototype[i.replace("open","iterate")]=function(){var t,e=(t=arguments,Array.prototype.slice.call(t)),o=e[e.length-1],n=this._store||this._index,r=n[i].apply(n,e.slice(0,-1));r.onsuccess=function(){o(r.result)}}})}),[r,u].forEach(function(t){t.prototype.getAll||(t.prototype.getAll=function(t,o){var n=this,r=[];return new Promise(function(e){n.iterateCursor(t,function(t){t?(r.push(t.value),void 0===o||r.length!=o?t.continue():e(r)):e(r)})})})});var p={open:function(t,e,o){var n=i(indexedDB,"open",[t,e]),r=n.request;return r.onupgradeneeded=function(t){o&&o(new l(r.result,t.oldVersion,r.transaction))},n.then(function(t){return new f(t)})},delete:function(t){return i(indexedDB,"deleteDatabase",[t])}};"undefined"!=typeof module?(module.exports=p,module.exports.default=module.exports):self.idb=p}();
//# sourceMappingURL=vendor.js.map