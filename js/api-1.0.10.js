const API_URL =  'https://api.vyper.online/'
const COMPILE_ENDPOINT = 'compile/'
const EXAMPLE_URL = 'https://raw.githubusercontent.com/ethereum/vyper/master/examples/'


var API = (function(API, $, undefined) {
  
  API.editor = null
  API.abiEditor = null
  API.lllEditor = null
  
  API.params = {
    'source': ""
  }
  
  API.loadExample = function(example, showConfirm) {
    var confirmed = true;
    if (showConfirm) {
      var loadMsg = "Current editor contents will be lost! Continue?";
      confirmed = confirm(loadMsg);
    }
    
    if (confirmed) {
      let reqURL
      if (example.substr(0, 4) === 'http') {
        reqURL = example;
      } else {
        reqURL = EXAMPLE_URL + example;
      }
      $.get(reqURL , function(data) {
        API.editor.setValue(data);
        API.editor.clearSelection();
      })
      .fail(function(e) {
        alert("Example from resource " + reqURL + " could not be loaded!");
      })
    }
  }
  
  API.setCompileToUnknown = function() {
    $('#bytecodeResult').html('<i class="fa fa-question-circle" aria-hidden="true"></i>')
    $('#abiResult').html('<i class="fa fa-question-circle" aria-hidden="true"></i>')
    $('#lllResult').html('<i class="fa fa-question-circle" aria-hidden="true"></i>')
  }
  
  API.load = function() {
    $('#result').empty();
    this.params['source'] = this.editor.getValue();
    this.setCompileToUnknown();
    
    $.ajax({
      url: API_URL + COMPILE_ENDPOINT,
      method: 'POST',
      cache: false,
      dataType: 'json',
      data: this.params,
      success: function(data) {
        if (data.result.bytecode_code === 200) {
          $('#bytecodeResult').html('<i class="fa fa-check" aria-hidden="true"></i>')
        } else {
          $('#bytecodeResult').html('<i class="fa fa-exclamation-circle" aria-hidden="true"></i>')
        }
        $('#bytecode').html(data.result.bytecode)
        
        if (data.result.json_code === 200 && data.result.abi_code === 200) {
          $('#abiResult').html('<i class="fa fa-check" aria-hidden="true"></i>')
        } else {
          $('#abiResult').html('<i class="fa fa-exclamation-circle" aria-hidden="true"></i>')
        }
        $('#abiCompact').html(data.result.json)
        var abiVal = null
        if (data.result.abi_code === 200) {
          abiVal = JSON.stringify(data.result.abi, null, 4)
        } else {
          abiVal = data.result.abi
        }
        API.abiEditor.setValue(abiVal)
        API.abiEditor.clearSelection()
        if (data.result.lll_code === 200) {
          $('#lllResult').html('<i class="fa fa-check" aria-hidden="true"></i>')
        } else {
          $('#lllResult').html('<i class="fa fa-exclamation-circle" aria-hidden="true"></i>')
        }
        API.lllEditor.setValue(data.result.lll)
        API.lllEditor.clearSelection()
      },
      fail: function() {
        $('#result').html("Mah.")
      }
    })
  };
  
  API.init = function() {
    console.log("API initialized.")
    
    this.editor = ace.edit("editor");
    this.editor.setTheme("ace/theme/crimson_editor");
    this.editor.getSession().setMode("ace/mode/vyper"); 
    
    this.abiEditor = ace.edit("abiReadable");
    this.abiEditor.setTheme("ace/theme/crimson_editor");
    this.abiEditor.getSession().setMode("ace/mode/json");
    this.abiEditor.renderer.setShowGutter(false);
    
    this.lllEditor = ace.edit("lll");
    this.lllEditor.setTheme("ace/theme/chrome");
    this.lllEditor.getSession().setMode("ace/mode/clojure"); 
    this.lllEditor.renderer.setShowGutter(false);
    
    if (localStorage.getItem("currentDocument")) {
      this.editor.setValue(localStorage.getItem("currentDocument"));
      this.editor.clearSelection();
    } else {
      API.loadExample('voting/ballot.vy', false);
    }
    
    
    this.editor.getSession().on('change', function(e) {
      API.setCompileToUnknown();
      localStorage.setItem("currentDocument", API.editor.getValue());
    });
  }
  
  return API;

}(API || {}, jQuery));

/* Load File Functionality */

function loadFile(filename) {
  console.log(filename);
  if (!confirm("Current editor contents will be lost! Continue?")) {
    return;
  }
  console.log(filename + "2");
  if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
    alert('The File APIs are not fully supported by your browser. Fallback required.');
    return;
  }
  
  var reader = new FileReader();
  var output = "";
  reader.onload = function(e) {
    output = e.target.result;
    displayContents(filename.name, output);
  };
  reader.readAsText(filename);
}

function loadFileDropped(ev) {
  ev.preventDefault();
  if (ev.dataTransfer.items) {
    loadFile(ev.dataTransfer.items[0].getAsFile());
  } else {
    loadFile(ev.dataTransfer.files[0]);
  }
}

function displayContents(filename, data) {
  filename = filename.replace(".vy", "");
  filename = filename.replace(".v.py", "");
  $("#filename").val(filename);
  API.editor.setValue(data);
  API.editor.clearSelection();
}
