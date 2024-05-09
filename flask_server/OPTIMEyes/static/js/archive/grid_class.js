/* Feeder inherits from default.js */

var GridTaskFeeder = {}; // Meant to be global

function init_app() {
  // Update global app feeder variable
  const config_obj = {
    endpoint_image_list: "image_grid_lists",
    message: "Relabel incorrect images",
    app: "grid"
  }
  GridTaskFeeder = new TaskFeeder(config_obj);
  // Override methods and attributes of interest

  // Attributes

  // - Methods
  GridTaskFeeder.getClassificationResults = function (imageList) {
    if (imageList === "no tasks left") {
      this.imageList = [];
      this.cachedClassifyResults = [];
      return "no tasks means no UI to build";
    }
    GTF = this; // otherwise "this" becomes the $.ajax object
    url_with_pararmeters = GTF.url_get_classification_results + `?username=${GTF.user}`
    if (GTF.currentTask.linked_with_image_list_name){
      url_with_pararmeters += `&list_name=${GTF.currentTask.linked_with_image_list_name}`
    }
    debugger
    return new Promise((resolve, reject) => {
      // debugger;
      $.ajax({
        url: url_with_pararmeters,
        type: 'GET',
        success: function (response) {
          var results = {};
          classifyResults = response.rows
          classifyResults.forEach((v, i, a) => {
            image_url = v.value.image
            image_id_index = image_url.search('image_comparator/') + 'image_comparator/'.length
            image_id = parseInt(image_url.substring(image_id_index, image_url.length))
            // debugger;
            results[image_id] = {normal:v.value.diagnosis_normal ? v.value.diagnosis_normal : (v.value.diagnoisis_normal ? v.value.diagnoisis_normal : false),
                                 ABV:v.value.diagnosis_ABV ? v.value.diagnosis_ABV : (v.value.diagnoisis_ABV ? v.value.diagnoisis_ABV : false),
                                 GSP:v.value.diagnosis_GSP ? v.value.diagnosis_GSP : (v.value.diagnoisis_GSP ? v.value.diagnoisis_GSP : false),
                                 HSP:v.value.diagnosis_HSP ? v.value.diagnosis_HSP : (v.value.diagnoisis_HSP ? v.value.diagnoisis_HSP : false),
                                 RP:v.value.diagnosis_RP ? v.value.diagnosis_RP : (v.value.diagnoisis_RP ? v.value.diagnoisis_RP : false),
                                 other:v.value.diagnosis_other_checkbox ? v.value.diagnosis_other_checkbox : (v.value.diagnoisis_other_checkbox ? v.value.diagnoisis_other_checkbox : false),
                                 nabothian_cyst:v.value.diagnosis_nabothian_cyst ? v.value.diagnosis_nabothian_cyst : false,
                                 excessive_reflections:v.value.diagnosis_excessive_reflections ? v.value.diagnosis_excessive_reflections : false,
                                 inadequate:v.value.diagnosis_inadequate ? v.value.diagnosis_inadequate : (v.value.diagnoisis_inadequate ? v.value.diagnoisis_inadequate : false)}
          })
          GTF.cachedClassifyResults = results
          // debugger;
          resolve(results);
        },
        error: function (response) {
          console.log("getClassificationResults failed : " + JSON.stringify(response));
          reject(Error("getClassificationResults failed : " + JSON.stringify(response)))
        }
      });
    })

  };

  GridTaskFeeder.getPairResults = function (imageList) {
    if (imageList === "no tasks left") {
      return "no tasks left"
    }
    GTF = this; // otherwise "this" becomes the $.ajax object
    return new Promise((resolve, reject) => {
      $.ajax({
        url: GTF.url_get_pair_results + `?username=${GTF.user}`,
        type: 'GET',
        success: function (response) {
          var results = {};
          pairResults = response.rows
          pairResults.forEach((v, i, a) => {
            if (v.value.accept_or_reject === 'accept') {
              image_url0 = v.value.image0
              image_url1 = v.value.image1

              image_id_index0 = image_url0.search('image_comparator/') + 'image_comparator/'.length
              image_id_index1 = image_url1.search('image_comparator/') + 'image_comparator/'.length

              image_id0 = parseInt(image_url0.substring(image_id_index0, image_url0.length))
              image_id1 = parseInt(image_url1.substring(image_id_index1, image_url1.length))

              results[image_id0] = v.value.classification0
              results[image_id1] = v.value.classification1
            }
          })
          // debugger
          // GTF.results = results // No longer needed.
          resolve(results);
        },
        error: function (response) {
          console.log("getPairResults failed : " + JSON.stringify(response));
          reject(Error("getPairResults failed : " + JSON.stringify(response)))
        }
      });
    })

  };

  GridTaskFeeder.buildUI = function (imageList, update=false) {
    GTF = this;
    console.log("in buildUI")
    if (imageList === "no tasks left") {
      this.imageList = [];
      return "no tasks means no UI to build";
    }

    if (this.gridAppRedirect === true) {
      // If we have results from the classify or pair app use those
      results = this.cachedClassifyResults
      // results = {}
      // results[101] = this.cachedClassifyResults[101]
      // results[102] = this.cachedClassifyResults[102]
      // results[103] = this.cachedClassifyResults[103]
      // results[104] = this.cachedClassifyResults[104]
      // results[105] = this.cachedClassifyResults[105]
      // results[106] = this.cachedClassifyResults[106]
      // results[107] = this.cachedClassifyResults[107]
      // results[108] = this.cachedClassifyResults[108]
      // results[109] = this.cachedClassifyResults[109]
      // results[110] = this.cachedClassifyResults[110]
      // results[111] = this.cachedClassifyResults[111]
      // results[112] = this.cachedClassifyResults[112]
      // results[113] = this.cachedClassifyResults[113]
      // results[114] = this.cachedClassifyResults[114]
      // results[113] = this.cachedClassifyResults[113]
      // results[116] = this.cachedClassifyResults[116]
      // results[117] = this.cachedClassifyResults[117]
      // results[118] = this.cachedClassifyResults[118]
      // results[119] = this.cachedClassifyResults[119]
      // results[120] = this.cachedClassifyResults[120]
      // results[121] = this.cachedClassifyResults[121]
      // results[122] = this.cachedClassifyResults[122]
      // results[123] = this.cachedClassifyResults[123]
      // results[124] = this.cachedClassifyResults[124]
      // debugger
      normal_results = [];
      ABV_results = [];
      GSP_results = [];
      HSP_results = [];
      RP_results = [];
      Other_results = [];
      Nabothian_Cyst_results = [];
      Excessive_Reflections_results = [];
      Inadequate_results = [];
      // not a result you'll see in the db; rather a computed property
      Uncategorized_results = [];

      Object.values(results).forEach((v, i, a) => {
        var keys = Object.keys(results)
        // image_id = i + 1;
        image_id = keys[i];
        
        // if (image_id === '106'){
        //   debugger
        // }
        if (v['normal']) {
          normal_results.push(image_id)
        }
        if (v['ABV']) {
          ABV_results.push(image_id)
        }
        if (v['GSP']) {
          GSP_results.push(image_id)
        }
        if (v['HSP']) {
          HSP_results.push(image_id)
        }
        if (v['RP']) {
          RP_results.push(image_id)
        }
        if (v['other']) {
          Other_results.push(image_id)
        }
        if (v['nabothian_cyst']) {
          Nabothian_Cyst_results.push(image_id)
        }
        if (v['excessive_reflections']) {
          Excessive_Reflections_results.push(image_id)
        }
        if (v['inadequate']) {
          Inadequate_results.push(image_id)
        }
        // debugger
        if (!v['normal'] && !v['ABV'] && !v['GSP'] && !v['HSP'] && !v['RP'] && !v['other'] && !v['nabothian_cyst'] && !v['excessive_reflections'] && !v['inadequate']){
          Uncategorized_results.push(image_id)
        }
      })

      imageList = {Normal_tab:normal_results,
                   ABV_tab:ABV_results,
                   GSP_tab:GSP_results,
                   HSP_tab:HSP_results,
                   RP_tab:RP_results,
                   Other_tab:Other_results,
                   Nabothian_Cyst_tab:Nabothian_Cyst_results,
                   Excessive_Reflections_tab:Excessive_Reflections_results,
                   Inadequate_tab:Inadequate_results,
                   Uncategorized_tab:Uncategorized_results}
    }

    function fill_tab(tab_name){
      // if(tab_name === "Uncategorized_tab"){
      //   debugger
      // }
      grid_of_images = $(`#${tab_name}`);
      grid_of_images.empty()
      let n_count = imageList[tab_name].length;
      let width = $("#img_columns")[0].value
      // let width = 5;
      let col_sizes = { 1: 12, 2: 6, 3: 4, 4: 3, 5: 2 }
      // debugger
      height = Math.floor(n_count / width) + Math.ceil(n_count / width);
      [...Array(height).keys()].forEach((v, i, a) => {
        // debugger
        console.log(`making row ${i}`)
        var row = $(`<div class="row"></div>`)
        // debugger
        grid_of_images.append(row)
        imageList[tab_name].slice(v * width, (v + 1) * width).forEach((v, i, a) => {
          // debugger
          var col = $(`<div class="col-xs-${col_sizes[width]}"></div>`)
          // var img = $(`<img src="/static/img/TCGA_CS_4944.png" alt="">`)
          var img = $(`<img id="image${v}_${tab_name}" src="" class="img-responsive" alt="">`)
          // debugger
          // var label = $(`<label for="choices">Remove:</label>`)
          var label = $(`<label id=image${v}_${tab_name}_filename>filename:</label>`)
          // selection_list = ['lateral','frontal'] //for later development
          // debugger
          if (GTF.gridAppRedirect === true) {
            // debugger
            if (tab_name != 'Uncategorized_tab'){
              template_edit_modal_and_button = GridTaskFeeder.buildEditDialog(imageID=v, tabName=tab_name)
              template_button = template_edit_modal_and_button[0]
              template_modal = template_edit_modal_and_button[2]
              // debugger;
              // var button = $(`<button id="remove_${v}_${tab_name}">Remove</button>`)
              // button[0].addEventListener('click', function(evt) {
              //   image_id = evt['target']['id'].replace('remove_','')
              //                                 .replace('_Normal_tab','')
              //                                 .replace('_ABV_tab','')
              //                                 .replace('_GSP_tab','')
              //                                 .replace('_HSP_tab','')
              //                                 .replace('_RP_tab','')
              //                                 .replace('_Other_tab','')
              //                                 .replace('_Nabothian_Cyst_tab','')
              //                                 .replace('_Excessive_Reflections_tab','')
              //                                 .replace('_Inadequate_tab','')
              //   classification = tab_name.replace('_tab','')
              //   if(tab_name.replace('_tab','') === 'Normal' || tab_name.replace('_tab','') === 'Inadequate' || tab_name.replace('_tab','') === 'Excessive_Reflections' || tab_name.replace('_tab','') === 'Nabothian_Cyst'){
              //     classification = classification.toLowerCase()
              //   }                
              //   // debugger;
              //   GTF.cachedClassifyResults[image_id][classification] = false;
              //   // debugger
              //   // Remove from current tab
              //   document.getElementById(`image${v}_${tab_name}`).remove()
              //   document.getElementById(`image${v}_${tab_name}_filename`).remove()
              //   document.getElementById(`remove_${v}_${tab_name}`).remove()
              //   GTF.buildUI(imageList, update=true) // we need to cache or do something creative
              // });
            }else{
              var label = $(`<label id=image${v}_${tab_name}_filename>Removed</label>`)
            }
          } else {
            var select = $(`<select name="class" id="image${v}_${tab_name}">
                              <option value="normal" selected}>normal</option>
                              <option value="ABV">ABV</option>
                              <option value="GSP">GSP</option>
                              <option value="HSP">HSP</option>
                              <option value="RP">RP</option>
                              <option value="other">other</option>
                            </select>`)
          }
          row.append(col)
          // col.append(img, label, button, template_button, template_modal)
          col.append(img, label, template_button, template_modal)
          GridTaskFeeder.initCheckboxListener(imageID=v, tabName=tab_name)
          GTF.getBase64DataOfImageFromCouch(v, htmlID = `image${v}_${tab_name}`); // set image
        })
      })
    };
    if(update===true){
      // debugger
      // fill_tab('Uncategorized_tab')
      GridTaskFeeder.updateImage(imageID)
      
    }else{
      Object.keys(imageList).forEach((v,i,a) => {
        fill_tab(v) // Fill each tab
      })
    }
    // Initialize First Tab
    document.getElementById("first_tab").click();
  };


  GridTaskFeeder.gridSubmit = function () {
    TF = this;
    
    console.log("gridSubmit");
    // Gather all imageIDs
    if(!GTF.gridAppRedirect){
      let images = $("select[name='class']");

      // Gather all responses and ids
      // image_ids = images.map((i) => {return `image_${i+1}`})
  
      image_ids = images.map((i) => { return images[i].id })
      image_results = images.map((i) => { return images[i].value })
  
      couch_results = {}
      image_ids.toArray().forEach((v, i, a) => {
        couch_results[v] = image_results[i]
      })
    } else {
      // debugger;
      couch_results = GTF.cachedClassifyResults
    }


    now = new Date()
    save_results = {
      user: this.user,
      type: "gridResult",
      date: now,
      couch_results: couch_results,
      task_list_name: this.currentTask.list_name,
      // task_idx: "6"
    }

    $.ajax({
      url: `http://${DNS}:${HTTP_PORT}/task_results`,
      data: JSON.stringify(save_results),
      dataType: "json",
      type: 'POST',
      contentType: 'application/json',
      success: function (response) {
        console.log('success')
        // Remove Images
        $('#grid_of_images').empty()
        // Reset incomplete tasks list
        TF.OnSetUser(TF.user)
      },
      error: function (response) {
        console.log("get of tasks failed : " + JSON.stringify(response));
      }
    });

  };

  GridTaskFeeder.openDiagnosisTab = function (evt, diagnosisTab) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(diagnosisTab).style.display = "block";
    evt.currentTarget.className += " active";
  };

  GridTaskFeeder.buildEditDialog = function (imageID, tabName) {
    var template = $(`
    <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#gridAnnotationChange_${imageID}_${tabName}">Edit</button>
    <div class="modal fade" id="gridAnnotationChange_${imageID}_${tabName}" tabindex="-1" role="dialog" aria-labelledby="gridAnnotationChangeLabel_${imageID}_${tabName}"
      aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="gridAnnotationChangeLabel_${imageID}_${tabName}">Grid Annotation Change</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">

            <h2 class="page-header">Choices:</h2>
            <input type="checkbox" id="normal_${imageID}_${tabName}" name="normal_${imageID}_${tabName}" value="normal_${imageID}_${tabName}">
            <label for="normal_${imageID}_${tabName}"> Normal (0)</label>
            <br>
            <input type="checkbox" id="ABV_${imageID}_${tabName}" name="ABV_${imageID}_${tabName}" value="ABV_${imageID}_${tabName}">
            <label for="ABV_${imageID}_${tabName}"> ABV (1)</label>
            <br>
            <input type="checkbox" id="GSP_${imageID}_${tabName}" name="GSP_${imageID}_${tabName}" value="GSP_${imageID}_${tabName}">
            <label for="GSP_${imageID}_${tabName}"> GSP (2)</label>
            <br>
            <input type="checkbox" id="HSP_${imageID}_${tabName}" name="HSP_${imageID}_${tabName}" value="HSP_${imageID}_${tabName}">
            <label for="HSP_${imageID}_${tabName}"> HSP (3)</label>
            <br>
            <input type="checkbox" id="RP_${imageID}_${tabName}" name="RP_${imageID}_${tabName}" value="RP_${imageID}_${tabName}">
            <label for="RP_${imageID}_${tabName}"> RP (4)</label>
            <br>
            <input type="checkbox" id="other_checkbox_${imageID}_${tabName}" name="other_checkbox_${imageID}_${tabName}" value="other_checkbox_${imageID}_${tabName}">
            <label for="other_checkbox_${imageID}_${tabName}"> Other (5)</label>
            <br>
            <input type="checkbox" id="nabothian_cyst_${imageID}_${tabName}" name="nabothian_cyst_${imageID}_${tabName}" value="nabothian_cyst_${imageID}_${tabName}">
            <label for="nabothian_cyst_${imageID}_${tabName}"> Nabothian Cyst (6)</label>
            <br>
            <input type="checkbox" id="excessive_reflections_${imageID}_${tabName}" name="excessive_reflections_${imageID}_${tabName}" value="excessive_reflections_${imageID}_${tabName}">
            <label for="excessive_reflections_${imageID}_${tabName}"> Exc. Reflections (7)</label>
            <br>
            <input type="checkbox" id="inadequate_${imageID}_${tabName}" name="inadequate_${imageID}_${tabName}" value="inadequate_${imageID}_${tabName}">
            <label for="inadequate_${imageID}_${tabName}"> Inadequate (8)</label>
            <br>

          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal" onclick="GridTaskFeeder.updateImage(imageID='${imageID}', tabName='${tabName}')">Update</button>
          </div>
        </div>
      </div>
    </div>`
    )    
    return template
  };

  GridTaskFeeder.initCheckboxListener = function (imageID, tabName) {
    TF = this;
    normal_checkbox = document.getElementById(`normal_${imageID}_${tabName}`);
    ABV_checkbox = document.getElementById(`ABV_${imageID}_${tabName}`);
    GSP_checkbox = document.getElementById(`GSP_${imageID}_${tabName}`);
    HSP_checkbox = document.getElementById(`HSP_${imageID}_${tabName}`);
    RP_checkbox = document.getElementById(`RP_${imageID}_${tabName}`);
    other_checkbox = document.getElementById(`other_checkbox_${imageID}_${tabName}`);
    nabothian_cyst_checkbox = document.getElementById(`nabothian_cyst_${imageID}_${tabName}`);
    excessive_reflections_checkbox = document.getElementById(`excessive_reflections_${imageID}_${tabName}`);
    inadequate_checkbox = document.getElementById(`inadequate_${imageID}_${tabName}`);
    // If anything but normal is checked, unselect normal
    // debugger;
    var imageid_tabname_retrieval = function(evt){
      // debugger
      first_underscore = evt.target.id.search("_")
      from_first_underscore_to_end_of_image_id = evt.target.id.slice(first_underscore+1, )
      second_underscore = from_first_underscore_to_end_of_image_id.search("_")
      image_id = from_first_underscore_to_end_of_image_id.slice(0, second_underscore)
      if (isNaN(parseInt(image_id)) ){
        // other_checkbox, nabothian_cyst or excessive_reflections need additional parsing
        from_first_underscore_to_end_of_image_id = evt.target.id.slice(first_underscore+1, ).replace("checkbox_","").replace("cyst_","").replace("reflections_","")
        second_underscore = from_first_underscore_to_end_of_image_id.search("_")
        image_id = from_first_underscore_to_end_of_image_id.slice(0, second_underscore)
      }
      from_second_underscore_to_end_of_tab_name = from_first_underscore_to_end_of_image_id.slice(second_underscore+1, )
      tab_name = from_second_underscore_to_end_of_tab_name
      return {imageID: image_id, tabName: tab_name}
    }
    if(ABV_checkbox === null){debugger}
    ABV_checkbox.addEventListener('change', function(evt) {
        imageid_tabname = imageid_tabname_retrieval(evt); imageID = imageid_tabname['imageID']; tabName = imageid_tabname['tabName'];
        document.getElementById(`normal_${imageID}_${tabName}`).checked = false;
        document.getElementById(`inadequate_${imageID}_${tabName}`).checked = false;
    });
    GSP_checkbox.addEventListener('change', function(evt) {
        imageid_tabname = imageid_tabname_retrieval(evt); imageID = imageid_tabname['imageID']; tabName = imageid_tabname['tabName'];
        document.getElementById(`normal_${imageID}_${tabName}`).checked = false;
        document.getElementById(`inadequate_${imageID}_${tabName}`).checked = false;
    });
    HSP_checkbox.addEventListener('change', function(evt) {
        imageid_tabname = imageid_tabname_retrieval(evt); imageID = imageid_tabname['imageID']; tabName = imageid_tabname['tabName'];
        document.getElementById(`normal_${imageID}_${tabName}`).checked = false;
        document.getElementById(`inadequate_${imageID}_${tabName}`).checked = false;
    });
    RP_checkbox.addEventListener('change', function(evt) {
        imageid_tabname = imageid_tabname_retrieval(evt); imageID = imageid_tabname['imageID']; tabName = imageid_tabname['tabName'];
        document.getElementById(`normal_${imageID}_${tabName}`).checked = false;
        document.getElementById(`inadequate_${imageID}_${tabName}`).checked = false;
    });
    other_checkbox.addEventListener('change', function(evt) {
        imageid_tabname = imageid_tabname_retrieval(evt); imageID = imageid_tabname['imageID']; tabName = imageid_tabname['tabName'];
        document.getElementById(`normal_${imageID}_${tabName}`).checked = false;
        document.getElementById(`inadequate_${imageID}_${tabName}`).checked = false;
    });
    nabothian_cyst_checkbox.addEventListener('change', function(evt) {
        imageid_tabname = imageid_tabname_retrieval(evt); imageID = imageid_tabname['imageID']; tabName = imageid_tabname['tabName'];
        document.getElementById(`normal_${imageID}_${tabName}`).checked = false;
        document.getElementById(`inadequate_${imageID}_${tabName}`).checked = false;
    });
    excessive_reflections_checkbox.addEventListener('change', function(evt) {
      imageid_tabname = imageid_tabname_retrieval(evt); imageID = imageid_tabname['imageID']; tabName = imageid_tabname['tabName'];
        document.getElementById(`normal_${imageID}_${tabName}`).checked = false;
        document.getElementById(`inadequate_${imageID}_${tabName}`).checked = false;
    });
    // If inadequate is checked unselect everything else
    inadequate_checkbox.addEventListener('change', function(evt) {
      imageid_tabname = imageid_tabname_retrieval(evt); imageID = imageid_tabname['imageID']; tabName = imageid_tabname['tabName'];
        if(document.getElementById(`inadequate_${imageID}_${tabName}`).checked === true){
            document.getElementById(`normal_${imageID}_${tabName}`).checked = false
            document.getElementById(`ABV_${imageID}_${tabName}`).checked = false
            document.getElementById(`GSP_${imageID}_${tabName}`).checked = false
            document.getElementById(`HSP_${imageID}_${tabName}`).checked = false
            document.getElementById(`RP_${imageID}_${tabName}`).checked = false
            document.getElementById(`other_checkbox_${imageID}_${tabName}`).checked = false
            document.getElementById(`nabothian_cyst_${imageID}_${tabName}`).checked = false
            document.getElementById(`excessive_reflections_${imageID}_${tabName}`).checked = false
            
        }          
    });
    // If normal is checked unselect everything else
    normal_checkbox.addEventListener('change', function() {
      if(document.getElementById(`normal_${imageID}_${tabName}`).checked === true){
        document.getElementById(`ABV_${imageID}_${tabName}`).checked = false
        document.getElementById(`GSP_${imageID}_${tabName}`).checked = false
        document.getElementById(`HSP_${imageID}_${tabName}`).checked = false
        document.getElementById(`RP_${imageID}_${tabName}`).checked = false
        document.getElementById(`other_checkbox_${imageID}_${tabName}`).checked = false
        document.getElementById(`nabothian_cyst_${imageID}_${tabName}`).checked = false
        document.getElementById(`excessive_reflections_${imageID}_${tabName}`).checked = false
        document.getElementById(`inadequate_${imageID}_${tabName}`).checked = false;
      }
    });
  };

  // GridTaskFeeder.checkEditDialog = function (imageID, tabName) {
  //   debugger
  // };

  GridTaskFeeder.updateImage = function (imageID, tabName) {
    // Function utils
    is_image_on_this_tab_already = function(tab){
      true_false = false;
      current_tab_rows = $(`#${tab}`).children().length
      for(let i_=0; i_<current_tab_rows; i_++){
        for(let j=0; j<$(`#${tab}`).children()[i_].children.length; j++){
          image_id_of_element = $(`#${tab}`).children()[i_].children[j].children[0].id.replace("image","").replace("_"+tab,"")
          if(imageID === image_id_of_element){
            // on tab already...do nothing
            true_false = true;
          }
        }
      }
      // debugger;
      return true_false;
    };
    place_on_tab = function(tab){
      // place on tab
      width = $("#img_columns")[0].value
      col_sizes = { 1: 12, 2: 6, 3: 4, 4: 3, 5: 2 }
      var col = $(`<div class="col-xs-${col_sizes[width]}"></div>`)
      var img = $(`<img id="image${imageID}_${tab}" src="" class="img-responsive" alt="">`)
      var label = $(`<label id=image${imageID}_${tab}_filename>filename:</label>`) 
      var row = $(`<div class="row"></div>`)
      template_edit_modal_and_button = GridTaskFeeder.buildEditDialog(imageID=imageID, tabName=tab)
      template_button = template_edit_modal_and_button[0]
      template_modal = template_edit_modal_and_button[2]
      row.append(col)
      col.append(img, label, template_button, template_modal)
      // debugger
      $(`#${tab}`).prepend(row)
      GridTaskFeeder.initCheckboxListener(imageID=imageID, tabName=tab)
      GTF.getBase64DataOfImageFromCouch(imageID, htmlID = `image${imageID}_${tab}`); // set image
    };
    remove_from_tab = function(tab, imageID){
      // debugger;
      document.getElementById(`image${imageID}_${tab}`).parentNode.remove()
    }
    // Get updates and update results
    //// inputs
    let checkboxes = ['normal','ABV','GSP','HSP','RP', 'other_checkbox', 'nabothian_cyst', 'excessive_reflections', 'inadequate']
    checkboxes.forEach((v,i,a) =>{
      if (v === "other_checkbox"){
        GTF.cachedClassifyResults[imageID]["other"] = document.getElementById(`${v}_${imageID}_${tabName}`).checked
      }else{
        GTF.cachedClassifyResults[imageID][v] = document.getElementById(`${v}_${imageID}_${tabName}`).checked
      }

    })
    // Shift Image
    //// Decide what tabs image should be in
    //// dumb...building map as I have inconsistent names...dirt code...
    map = {
      'normal':'Normal_tab',
      'ABV':'ABV_tab',
      'GSP':'GSP_tab',
      'HSP':'HSP_tab',
      'RP':'RP_tab',
      'other':'Other_tab',
      // 'other_checkbox':'Other_tab',
      'nabothian_cyst':'Nabothian_Cyst_tab',
      'excessive_reflections':'Excessive_Reflections_tab',
      'inadequate':'Inadequate_tab',
      'uncategorized':'Uncategorized_tab',
    }
    Object.keys(map).forEach((v,i,a) =>{
      tab = map[v]
      is_uncategorized = false;
      if (tab === "Uncategorized_tab"){
        is_uncategorized = true;
        Object.keys(GTF.cachedClassifyResults[imageID]).forEach((val, ind, arr)=>{
          // debugger;
          if(GTF.cachedClassifyResults[imageID][val] === true && val != "image_name"){
            is_uncategorized = false;
          }
        })
      }
      if(tab != undefined){
        if(GTF.cachedClassifyResults[imageID][v] || is_uncategorized){
          // Should be on this tab
          // is it on this tab already?
          if(!is_image_on_this_tab_already(tab)){
            place_on_tab(tab)
          }
        } else {
          // Shouldn't be on this tab
          if(is_image_on_this_tab_already(tab)){
            remove_from_tab(tab, imageID)
          }
        }
      }
    })
    //// Remove image from all tabs

    //// Loop through tabs and if image should be there put it there at index 1 and shift other images
    
  };

  /* Begin Grid app specific functionality */
  // debugger
  GridTaskFeeder.setPrompt()
  GridTaskFeeder.handleUrlFilter(document.location.search);

}
