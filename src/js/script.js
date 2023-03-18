function jsonFile(address) {
  const jsonDate = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Could not fetch ${url}, status: ${res.status}`);
    }
    return await res.json();
  };

  jsonDate(address)
    .then(data => {
      renderGantt(JSON.stringify(data));
    });
}

function renderGantt(jsonString) {
  const dataObject = JSON.parse(jsonString);
  am5.ready(function() {
    const obj = {
      init(titles, models, startDates, estimatedDates, maximumDeadline, finalDates) {
        this.titles = titles
        this.models = models
        this.startDates = startDates
        this.estimatedDates = estimatedDates
        this.maximumDeadline = maximumDeadline
        this.finalDates = finalDates
  
        this.func = function() {
          var row = document.createElement("div");
          row.style.borderBottom = "1px solid #eee";
          row.style.height = `${93 / (this.models.length + 1)}%`;
          row.style.clear = "left";
          row.style.display = "flex";
          row.style.alignItems = "center";
          div.appendChild(row);
      
          for (var i = 0; i < this.titles.length; i++) {
            var col = document.createElement("div");
            col.innerHTML = this.titles[i];
            col.style.fontSize = "14px";
            if (i == 0) {
              col.style.width = "8%";
            } else {
              col.style.width = "23%";
            }
            col.style.textAlign = "center";
            row.appendChild(col);
          }
      
          for (var i = 0; i < this.models.length; i++) {
            var model = this.models[i];
            var start = new Date(`${this.startDates[i]}`).toLocaleDateString();
            var estimatedDate = new Date(`${this.estimatedDates[i]}`).toLocaleDateString();
            var deadline = new Date(`${this.maximumDeadline[i]}`).toLocaleDateString();
            var final = new Date(`${this.finalDates[i]}`).toLocaleDateString();
      
            var row = document.createElement("div");
            row.style.borderBottom = "1px solid #eee";
            row.style.height = `${93 / (this.models.length + 1)}%`;
            row.style.clear = "left";
            row.style.display = "flex";
            row.style.alignItems = "center";
            div.appendChild(row);
      
            var col1 = document.createElement("div");
            col1.innerHTML = model;
            col1.style.fontSize = "14px";
            col1.style.width = "8%";
            col1.style.textAlign = "center";
            row.appendChild(col1);
      
            var col2 = document.createElement("div");
            col2.innerHTML = `${start}`;
            col2.style.fontSize = "14px";
            col2.style.width = "23%";
            col2.style.textAlign = "center";
            row.appendChild(col2);
      
            var col3 = document.createElement("div");
            col3.innerHTML = `${estimatedDate}`;
            col3.style.fontSize = "14px";
            col3.style.width = "23%";
            col3.style.textAlign = "center";
            row.appendChild(col3);
      
            var col4 = document.createElement("div");
            col4.innerHTML = `${deadline}`;
            col4.style.fontSize = "14px";
            col4.style.width = "23%";
            col4.style.textAlign = "center";
            row.appendChild(col4);
      
            var col5 = document.createElement("div");
            col5.innerHTML = `${final}`;
            col5.style.fontSize = "14px";
            col5.style.width = "23%";
            col5.style.textAlign = "center";
            row.appendChild(col5);
          }
        }
      }
    }
  
    var div = document.getElementById("chartdiv");
    div.style.overflow = "auto";
  
    const legend = Object.create(obj)
    
    legend.init(
      dataObject.titles,
      dataObject.models,
      dataObject.startDates,
      dataObject.estimatedDates,
      dataObject.maximumDeadline,
      dataObject.finalDates
    )
    legend.func();
  });
  
  am5.ready(function() {
    // Create root element
    var root = am5.Root.new("chartdiv2");
    root.dateFormatter.setAll({
      dateFormat: "yyyy-MM-dd",
      dateFields: ["valueX", "openValueX"]
    });
    
    // Set themes
    root.setThemes([
      am5themes_Animated.new(root)
    ]);
    
    // Create chart
    var chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout
    }));
    
    // Data
    let data = [];
    let categories = [];
    let obj = {
      init(category, start, end, columnSettings, hours, task) {
        this.category = category
        this.start = start,
        this.end = end,
        this.columnSettings = columnSettings
        this.hours = hours
        this.task = task
      }
    }
    let task = {
      init(category) {
        this.category = category
      }
    }
    dataObject.data.forEach(item => {
      let gant = Object.create(obj)
      gant.init(
        item.category,
        new Date(`${item.start}`).getTime(),
        new Date(`${item.end}`).getTime(),
        item.columnSettings,
        item.hours,
        item.task
      )
      data.push(gant);
    });
    dataObject.category.forEach(item => {
      let taskName = Object.create(task)
      taskName.init(item.category)
      categories.push(taskName);
    });
        
    // Create axes
    var yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: am5xy.AxisRendererY.new(root, {}),
        tooltip: am5.Tooltip.new(root, {})
      })
    );
    
    yAxis.data.setAll(categories);
    
    var xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "minute", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, {})
      })
    );
    
    // Add series
    var series = chart.series.push(am5xy.ColumnSeries.new(root, {
      xAxis: xAxis,
      yAxis: yAxis,
      openValueXField: "start",
      valueXField: "end",
      categoryYField: "category",
      sequencedInterpolation: true
    }));
    
    series.columns.template.setAll({
      templateField: "columnSettings",
      strokeOpacity: 0,
      tooltipText: "{task}"
    });
  
    series.bullets.push(function() {
      return am5.Bullet.new(root, {
        sprite: am5.Label.new(root, {
          text: "{hours}ч",
          centerY: am5.p50,
          centerX: am5.p50,
          populateText: true
        })
      });
    });
    
    series.data.setAll(data);
    
    // Add scrollbars
    chart.set("scrollbarX", am5.Scrollbar.new(root, { orientation: "horizontal" }));
    
    // Make stuff animate on load
    series.appear();
    chart.appear(1000, 100);
  });
}