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

  // - Methods
  GridTaskFeeder.getClassificationResults = function (imageList) {
    if (imageList === "no tasks left") {
      this.imageList = [];
      this.cachedClassifyResults = [];
      return "no tasks means no UI to build";
    }

    GTF = this; // otherwise "this" becomes the $.ajax object
    return new Promise((resolve, reject) => {
      // debugger;
      $.ajax({
        url: GTF.url_get_classification_results + `?username=${GTF.user}`,
        type: 'GET',
        success: function (response) {
          var results = {};
          classifyResults = response.rows
          classifyResults.forEach((v, i, a) => {
            image_url = v.value.image
            image_id_index = image_url.search('image_comparator/') + 'image_comparator/'.length
            image_id = parseInt(image_url.substring(image_id_index, image_url.length))
            results[image_id] = v.value.diagnosis
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

  GridTaskFeeder.buildUI = function (imageList) {
    console.log("in buildUI")
    if (imageList === "no tasks left") {
      this.imageList = [];
      return "no tasks means no UI to build";
    }
    debugger
    if (this.gridAppRedirect === true) {
      // If we have results from the classify or pair app use those
      results = this.cachedClassifyResults
      debugger
      not_sure = [];
      
      Object.values(results).forEach((v, i, a) => {
        var keys = Object.keys(results)
        // image_id = i + 1;
        image_id = keys[i];
        if (v === "not_sure") {
          not_sure.push(image_id)
        }
      })
      imageList = not_sure
    }

    debugger;
    grid_of_images = $('#grid_of_images');
    grid_of_images.empty()
    let n_count = imageList.length;
    let width = $("#img_columns")[0].value
    // let width = 5;
    let col_sizes = { 1: 12, 2: 6, 3: 4, 4: 3, 5: 2 }
    height = Math.floor(n_count / width) + n_count % width;
    [...Array(height).keys()].forEach((v, i, a) => {
      // debugger
      console.log(`making row ${i}`)
      var row = $(`<div class="row"></div>`)
      grid_of_images.append(row)
      imageList.slice(v * width, (v + 1) * width).forEach((v, i, a) => {
        var col = $(`<div class="col-xs-${col_sizes[width]}"></div>`)
        // var img = $(`<img src="/static/img/TCGA_CS_4944.png" alt="">`)
        var img = $(`<img id="image${v}"" src="" class="img-responsive" alt="">`)
        // debugger
        this.getBase64DataOfImageFromCouch(v, htmlID = `image${v}`); // set image
        var label = $(`<label for="choices">Choose a class:</label>`)
        // selection_list = ['lateral','frontal'] //for later development
        // debugger
        if (this.gridAppRedirect === true) {
          var select = $(`<select name="class" id="image_${v}">
                            <option value="not_sure" ${results[v] === 'not_sure' ? ' selected' : ''}>not_sure</option>
                            <option value="normal" ${results[v] === 'normal' ? ' selected' : ''}>normal</option>
                            <option value="gray_zone" ${results[v] === 'gray_zone' ? ' selected' : ''}>gray_zone</option>
                            <option value="precancer/cancer" ${results[v] === 'precancer/cancer' ? ' selected' : ''}>precancer/cancer</option>
                          </select>`)
        } else {
          var select = $(`<select name="class" id="image_${v}">
                            <option value="not_sure" selected}>not_sure</option>
                            <option value="normal">normal</option>
                            <option value="gray_zone">gray_zone</option>
                            <option value="precancer/cancer">precancer/cancer</option>
                          </select>`)
        }
        row.append(col)
        col.append(img, label, select)
      })
    })
  };

  GridTaskFeeder.gridSubmit = function () {
    TF = this;
    console.log("gridSubmit");
    // Gather all imageIDs
    let = images = $("select[name='class']");

    // Gather all responses and ids
    // image_ids = images.map((i) => {return `image_${i+1}`})

    image_ids = images.map((i) => { return images[i].id })
    image_results = images.map((i) => { return images[i].value })

    couch_results = {}
    image_ids.toArray().forEach((v, i, a) => {
      couch_results[v] = image_results[i]
    })


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

  /* Begin Grid app specific functionality */
  // debugger
  GridTaskFeeder.setPrompt()
  GridTaskFeeder.handleUrlFilter(document.location.search);

}
