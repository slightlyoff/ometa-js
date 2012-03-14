(function(scope) {
  // FIXME(slightlyoff): 
  //        Re-enable strict mode when I figure out what's going on with
  //        global assignments in the compiler.
  // "use strict";

  var translateCode = function(s) {
    var translationError = function(m, i) {
      alert("Translation error - please tell Alex about this!");
      throw fail;
    };
    var tree = BSOMetaJSParser.matchAll(
        s,
        "topLevel",
        undefined,
        function(m, i) {
          throw om.objectThatDelegatesTo(fail, {errorPos: i});
        }
    );
    return BSOMetaJSTranslator.match(tree, "trans", undefined, translationError);
  };

  // Old browsers can suck eggs.
  window.addEventListener("load", function(e) {
    var scripts = 
        document.documentElement.querySelectorAll("script[type='text\\/x-ometa-js']");
    for (var idx = 0; idx < scripts.length; idx++) {
      eval(translateCode(scripts[idx].innerHTML));
    }
  }, false);

})(this);
