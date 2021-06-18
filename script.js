var margin = { top: 20, right: 0, bottom: 20, left: 0 };
    width = 945 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    formatPercent = d3.format(".1%");

var svg = d3.select("#map").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var worldDataJson = ""

const projection = d3.geoNaturalEarth2()
    .translate([width / 2, height / 2]);

const path = d3.geo.path()
    .projection(projection);

svg.append('path')
    .attr('class', 'sphere')
    .attr('d', path({ type: 'Sphere' }));

var legendText = ["no data", "0", "500", "1 000", "1 500", "2 000", "2 500", "≥ 3 000"];
var legendColors = ["#000", "#FFF0E9", "#FEE5DA", "#FDCFBC", "#FCA588", "#FC9475", "#F86247", "#C61A1D"];

const numericCodeFromAlphaCode = new Map();
const AlphaCodeFromnumericCode = new Map();

/////// Dico qui associe le code 3 ///////
d3.csv('https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/slim-3/slim-3.csv').then(codes => {

    codes.forEach(code => {
        const alpha3Code = code['alpha-3'];
        const numericCode = code['country-code'];
        numericCodeFromAlphaCode.set(alpha3Code, numericCode);
        AlphaCodeFromnumericCode.set(numericCode, alpha3Code);
    });
    //console.log(numericCodeFromAlphaCode)
});
const rowByNumericCode = new Map();

/////// Map for new covid cases and vaccinated people ///////
d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json').then(world => {
    worldDataJson = world
    ////// map stuff //////
    var countries = topojson.feature(world, world.objects.countries);
    interiors = topojson.mesh(world, countries, (a, b) => a !== b);

    /////// New covid cases ///////
    d3.csv('https://raw.githubusercontent.com/madziialenkaa/Covid-19_Dataviz/main/NewCasPour100.000V4.csv').then(data => {


        // console.log(countries);
        // console.log(interiors);

        //console.log(data['newcases']);

        // var color = d3.scale.threshold()
        //     .domain([0, 0.125, 0.25, 0.5, 0.75, 0.915, 1])
        //     .range(["#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"]);

        //console.log(data[0]["country;date;newcases;isocode"].split(";")[2]);

        var separateData = [];

        data.forEach(d => {
            const alpha3Code = d["country;date;newcases;isocode"].split(";")[3];
            const numericCode = numericCodeFromAlphaCode.get(alpha3Code);
            rowByNumericCode.set(numericCode, d);
            separateData.push({
                "country": d["country;date;newcases;isocode"].split(";")[0],
                "date": d["country;date;newcases;isocode"].split(";")[1],
                "newcases": d["country;date;newcases;isocode"].split(";")[2],
                "isocode": d["country;date;newcases;isocode"].split(";")[3]
            })
        });

        // const colorValue = d => d["country;date;newcases;isocode"].split(";")[2];
        const colorValue = []
        data.forEach(d => {
            colorValue.push(parseFloat(d["country;date;newcases;isocode"].split(";")[2]))
            return colorValue
        });

        const colorScale = d3.scaleSequential(d3.interpolateReds).domain([d3.min(colorValue), d3.max(colorValue)]);
        //console.log(colorScale(3502.232576198797))

        var countryShapes = svg.selectAll('path')
            .data(countries.features)
            .enter().append('path')
            .attr('class', 'country')
            .attr('d', path);

        svg.append("path")
            .datum(topojson.feature(world, world.objects.countries, function (a, b) { return a !== b; }))
            .attr("class", "country")
            .attr("d", path);

        ////////// play button //////////

        //var formatDateIntoYear = d3.timeFormat("%Y");
        var formatDate = d3.timeFormat("%Y-%m");
        var formatDate2 = d3.timeFormat("%Y-%m");
        var parseDate = d3.timeParse("%y%m/%d/");

        var startDate = new Date("2020-01-31"),
            endDate = new Date("2021-05-16");

        var margin_button = { top: 200, right: 80, bottom: 175, left: 20 },
            width_button = 900 - margin_button.left - margin_button.right,
            height_button = 500 - margin_button.top - margin_button.bottom;

        var svg_button = d3.select("#vis")
            .append("svg")
            .attr("width", width_button + margin_button.left + margin_button.right)
            .attr("height", height_button + margin_button.top + margin_button.bottom);

        ////////// slider //////////

        var moving = false;
        var currentValue = 0;
        var targetValue = width_button;

        var playButton = d3.select("#play-button");

        var x = d3.scaleTime()
            .domain([startDate, endDate])
            .range([0, targetValue])
            .clamp(true);

        var slider = svg_button.append("g")
            .attr("class", "slider")
            .attr("transform", "translate(" + margin_button.left + "," + height_button / 5 + ")")
            .style('fill', 'white');

        slider.append("line")
            .attr("class", "track")
            .attr("x1", x.range()[0])
            .attr("x2", x.range()[1])
            .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-inset")
            .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-overlay")
            .call(d3.drag()
                .on("start.interrupt", function () { slider.interrupt(); })
                .on("start drag", function () {
                    currentValue = d3.event.x;
                    update(x.invert(currentValue));
                })
            );

        slider.insert("g", ".track-overlay")
            .attr("class", "ticks")
            .attr("transform", "translate(0," + 18 + ")")
            .selectAll("text")
            .data(x.ticks(10))
            .enter()
            .append("text")
            .attr("x", x)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .text(function (d) { return formatDate(d); });

        var handle = slider.insert("circle", ".track-overlay")
            .attr("class", "handle")
            .attr("r", 9);

        var label = slider.append("text")
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .text(formatDate(startDate))
            .attr("transform", "translate(0," + (-25) + ")");

        ////////// plot //////////
        var dataset;

        var plot = svg.append("g")
            .attr("class", "plot")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var legend = svg.append("g")
            .attr("id", "legend")
            .style('fill', '#a5a5a5');

        var legenditem = legend.selectAll(".legenditem")
            .data(d3.range(8))
            .enter()
            .append("g")
            .attr("class", "legenditem")
            .attr("transform", function (d, i) { return "translate(" + i * 31 + ",0)"; });

        legenditem.append("rect")
            .attr("x", 680)
            .attr("y", 5)
            .attr("width", 33)
            .attr("height", 10)
            .attr("stroke", "black")
            .attr("class", "rect")
            .style("fill", function (d, i) { return legendColors[i]; });

        legenditem.append("text")
            .attr("x", 696)
            .attr("y", 3)
            .style("text-anchor", "middle")
            .text(function (d, i) { return legendText[i]; });

        d3.csv("https://raw.githubusercontent.com/madziialenkaa/Covid-19_Dataviz/main/NewCasPour100.000.csv", prepare, function (data) {
            dataset = data;
            playButton
                .on("click", function () {
                    var button = d3.select(this);
                    if (button.text() == "Pause") {
                        moving = false;
                        clearInterval(timer);
                        // timer = 0;
                        button.text("Play");
                    } else {
                        moving = true;
                        timer = setInterval(step, 100);
                        button.text("Pause");
                    }
                    console.log("Slider moving: " + moving);
                })
        })

        function prepare(d) {
            d.isocode = d.push(d["country;date;newcases;isocode"].split(";")[3]);
            d.date = d.push(parseDate(d["country;date;newcases;isocode"].split(";")[2]));
            console.log(d.isocode);
            console.log(d.date);
            return d;
        }

        function step() {
            // console.log(x.invert(currentValue));
            update(x.invert(currentValue));
            currentValue = currentValue + (targetValue / 151);
            if (currentValue > targetValue) {
                moving = false;
                currentValue = 0;
                clearInterval(timer);
                // timer = 0;
                playButton.text("Play");
                console.log("Slider moving: " + moving);
            }
        }

        function update(date) {
            slider.property('value', date)
            handle.attr("cx", x(date));
            d3.select(".date").text(date);
            label
                .attr("x", x(date))
                .text(formatDate(date));
            countryShapes.attr("d", path).style("fill", function (d) {
                if (rowByNumericCode.get(d.id)) {
                    const item = separateData.filter(element => element.isocode == AlphaCodeFromnumericCode.get(d.id))
                    const item2 = item.find(element => (element.date.split("-")[0] + "-" + element.date.split("-")[1]) == formatDate(date))
                    if (item2) return colorScale(item2.newcases)
                }
                return "#000"
            });
        }

    })

})
d3.select(self.frameElement).style("height", "685px");
