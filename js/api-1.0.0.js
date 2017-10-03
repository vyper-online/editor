var API_URL =  'https://api.viper.tools/'

var COMPILE_ENDPOINT = 'compile/'



var API = (function(API, $, undefined) {
  
  API.params = {
    'source': ""
  }
  
  API.load = function() {
    $('#result').empty();
    this.params['source'] = $('#viperSourceCode').val();
    
    $.ajax({
      url: API_URL + COMPILE_ENDPOINT,
      method: 'POST',
      cache: false,
      dataType: 'json',
      data: this.params,
      success: function(data) {
        $('#result').html(data.result.bytecode)
        
        $('#result2').html(data.result.json)
      },
      fail: function() {
        $('#result').html("Mah.")
      }
    })
  };
  
  API.init = function() {
    console.log("API initialized.")
  }
  
  return API;

}(API || {}, jQuery));
