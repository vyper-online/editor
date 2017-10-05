const API_URL =  'https://api.viper.tools/'
const COMPILE_ENDPOINT = 'compile/'
const EXAMPLE_URL = 'https://raw.githubusercontent.com/ethereum/viper/master/examples/'


var API = (function(API, $, undefined) {
  
  API.editor = null
  
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
      const reqURL = EXAMPLE_URL + example;
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
        if (data.result.abi_code === 200) {
          $('#abiReadable').html(JSON.stringify(data.result.abi, null, 4))
        }
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
    this.editor.getSession().setMode("ace/mode/python"); 
    
    if (localStorage.getItem("currentDocument")) {
      this.editor.setValue(localStorage.getItem("currentDocument"));
      this.editor.clearSelection();
    } else {
      API.loadExample('voting/ballot.v.py', false);
    }
    
    
    this.editor.getSession().on('change', function(e) {
      API.setCompileToUnknown();
      localStorage.setItem("currentDocument", API.editor.getValue());
    });
  }
  
  return API;

}(API || {}, jQuery));
