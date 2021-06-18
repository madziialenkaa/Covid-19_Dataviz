var margin_map2 = { top: 20, right: 0, bottom: 20, left: 0};
    width_map2 = 945 - margin_map2.left - margin_map2.right,
    height_map2 = 500 - margin_map2.top - margin_map2.bottom,
    formatPercent_map = d3.format(".1%");

var svg_map2 = d3.select("#map2").append("svg")
    .attr("width", width_map2 + margin_map2.left + margin_map2.right)
    .attr("height", height_map2 + margin_map2.top + margin_map2.bottom)
    .append("g")
    .attr("transform", "translate(" + margin_map2.left + "," + margin_map2.top + ")");

var worldDataJson2 = ""

const projection2 = d3.geoNaturalEarth2()
    .translate([width_map2 / 2, height_map2 / 2]);

const path2 = d3.geo.path()
    .projection(projection2);

svg_map2.append('path')
    .attr('class', 'sphere')
    .attr('d', path2({ type: 'Sphere' }));

var legendTextVaccin = ["no data", "0", "17.5k", "35k", "52.5k","70k", "87.5k","≥105k"];
var legendColorsVaccin = ["#000", "#F7FCF5","#ECF8E9", "#D7EFD1", "#ADDEA7", "#69BF72", "#5AB167", "#00481D" ]

const numericCodeFromAlphaCode2 = new Map();
const AlphaCodeFromnumericCode2 = new Map();

/////// Dico qui associe le code 3 ///////
d3.csv('https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/slim-3/slim-3.csv').then(codes2 => {

    codes2.forEach(code => {
        const alpha3Code2 = code['alpha-3'];
        const numericCode2 = code['country-code'];
        numericCodeFromAlphaCode2.set(alpha3Code2, numericCode2);
        AlphaCodeFromnumericCode2.set(numericCode2, alpha3Code2);
    });
    //console.log(numericCodeFromAlphaCode)
});
const rowByNumericCode2 = new Map();

/////// Map for new covid cases and vaccinated people ///////
d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json').then(world2 => {
    worldDataJson2 = world2
    ////// map stuff //////
    var countries2 = topojson.feature(world2, world2.objects.countries);
    interiors2 = topojson.mesh(world2, countries2, (a, b) => a !== b);

    /////// New vaccines ///////
    d3.csv('https://raw.githubusercontent.com/madziialenkaa/Covid-19_Dataviz/main/VaccinationPour100.000V4.csv').then(vaccin => {

        
        // console.log(countries);
        // console.log(interiors);

        //console.log(data['newcases']);

        // var color = d3.scale.threshold()
        //     .domain([0, 0.125, 0.25, 0.5, 0.75, 0.915, 1])
        //     .range(["#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"]);

        //console.log(data[0]["country;date;newcases;isocode"].split(";")[2]);

        var separateData2 = [];

        vaccin.forEach(d => {
            const alpha3Code2 = d["country;date;vaccination;isocode"].split(";")[3];
            const numericCode2 = numericCodeFromAlphaCode2.get(alpha3Code2);
            rowByNumericCode2.set(numericCode2, d);
            separateData2.push({
                "country": d["country;date;vaccination;isocode"].split(";")[0],
                "date": d["country;date;vaccination;isocode"].split(";")[1],
                "vaccination": d["country;date;vaccination;isocode"].split(";")[2],
                "isocode": d["country;date;vaccination;isocode"].split(";")[3]
            })
        });

        // const colorValue = d => d["country;date;newcases;isocode"].split(";")[2];
        const colorValueVaccin = []
        vaccin.forEach(d => {
            colorValueVaccin.push(parseFloat(d["country;date;vaccination;isocode"].split(";")[2]))
            return colorValueVaccin
        });

        const colorScaleVaccin = d3.scaleSequential(d3.interpolateGreens).domain([d3.min(colorValueVaccin), d3.max(colorValueVaccin)]);
        //console.log(colorScale(3502.232576198797))

        var countryShapes2 = svg_map2.selectAll('path')
            .data(countries2.features)
            .enter().append('path')
            .attr('class', 'country')
            .attr('d', path2);

        svg_map2.append("path")
            .datum(topojson.feature(world2, world2.objects.countries, function (a, b) { return a !== b; }))
            .attr("class", "country")
            .attr("d", path2);

        ////////// play button //////////

        //var formatDateIntoYear = d3.timeFormat("%Y");
        var formatDateVac = d3.timeFormat("%Y-%m");
        var formatDate2 = d3.timeFormat("%Y-%m");
        var parseDateVac = d3.timeParse("%y%m/%d/");

        var startDateVac = new Date("2020-01-31"),
            endDateVac = new Date("2021-05-16");

        var margin_button2 = { top: 200, right: 80, bottom: 175, left: 20 },
            width_button2 = 900 - margin_button2.left - margin_button2.right,
            height_button2 = 500 - margin_button2.top - margin_button2.bottom;

        var svg_button2 = d3.select("#vis2")
            .append("svg")
            .attr("width", width_button2 + margin_button2.left + margin_button2.right)
            .attr("height", height_button2 + margin_button2.top + margin_button2.bottom);

        ////////// slider //////////

        var moving2 = false;
        var currentValue2 = 0;
        var targetValue2 = width_button2;

        var playButton2 = d3.select("#play-button2");

        var x2 = d3.scaleTime()
            .domain([startDateVac, endDateVac])
            .range([0, targetValue2])
            .clamp(true);
        
        var slider2 = svg_button2.append("g")
            .attr("class", "slider2")
            .attr("transform", "translate(" + margin_button2.left + "," + height_button2 / 5 + ")")
            .style('fill', 'white');

        slider2.append("line")
            .attr("class", "track")
            .attr("x1", x2.range()[0])
            .attr("x2", x2.range()[1])
            .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-inset")
            .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-overlay")
            .call(d3.drag()
                .on("start.interrupt", function () { slider2.interrupt(); })
                .on("start drag", function () {
                    currentValue2 = d3.event.x2;
                    update2(x2.invert(currentValue2));
                })
            );

        slider2.insert("g", ".track-overlay")
            .attr("class", "ticks")
            .attr("transform", "translate(0," + 18 + ")")
            .selectAll("text")
            .data(x2.ticks(10))
            .enter()
            .append("text")
            .attr("x", x2)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .text(function (d) { return formatDateVac(d); });

        var handle2 = slider2.insert("circle", ".track-overlay")
            .attr("class", "handle")
            .attr("r", 9);

        var label2 = slider2.append("text")
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .text(formatDateVac(startDateVac))
            .attr("transform", "translate(0," + (-25) + ")");

        ////////// plot //////////
        var dataset2;

        var plot2 = svg_map2.append("g")
            .attr("class", "plot")
            .attr("transform", "translate(" + margin_map2.left + "," + margin_map2.top + ")");
        
        var legend2 = svg_map2.append("g")
            .attr("id", "legend")
            .style('fill', '#a5a5a5');

        var legenditem2 = legend2.selectAll(".legenditem")
            .data(d3.range(8))
            .enter()
            .append("g")
                .attr("class", "legenditem")
                .attr("transform", function(d, i) { return "translate(" + i * 31 + ",0)"; });
    
        legenditem2.append("rect")
            .attr("x", 680)
            .attr("y", 5)
            .attr("width", 33)
            .attr("height", 10)
            .attr("stroke", "black")
            .attr("class", "rect")
            .style("fill", function(d, i) { return legendColorsVaccin[i]; });
    
        legenditem2.append("text")
            .attr("x", 696)
            .attr("y", 3)
            .style("text-anchor", "middle")
            .text(function(d, i) { return legendTextVaccin[i]; });

        d3.csv("https://raw.githubusercontent.com/madziialenkaa/Covid-19_Dataviz/main/VaccinationPour100.000.csv", prepare2, function (vaccin) {
            dataset2 = vaccin;
            playButton2
                .on("click", function () {
                    var button2 = d3.select(this);
                    if (button2.text() == "Pause") {
                        moving2 = false;
                        clearInterval(timer2);
                        // timer = 0;
                        button2.text("Play");
                    } else {
                        moving2 = true;
                        timer2 = setInterval(step2, 100);
                        button2.text("Pause");
                    }
                    console.log("Slider moving: " + moving2);
                })
        })

        function prepare2(d) {
            d.isocode = d.push(d["country;date;vaccination;isocode"].split(";")[3]);
            d.date = d.push(parseDateVac(d["country;date;vaccination;isocode"].split(";")[2]));
            console.log(d.isocode);
            console.log(d.date);
            return d;
        }

        function step2() {
            // console.log(x.invert(currentValue));
            update2(x2.invert(currentValue2));
            currentValue2 = currentValue2 + (targetValue2 / 151);
            if (currentValue2 > targetValue2) {
                moving2 = false;
                currentValue2 = 0;
                clearInterval(timer2);
                // timer = 0;
                playButton2.text("Play");
                console.log("Slider moving: " + moving2);
            }
        }

        function update2(date) {
            slider2.property('value', date)
            handle2.attr("cx", x2(date));
            d3.select(".date").text(date);
            label2
                .attr("x", x2(date))
                .text(formatDateVac(date));
            countryShapes2.attr("d", path2).style("fill", function (d) {
                if (rowByNumericCode2.get(d.id)) {
                    const itemvac = separateData2.filter(element2 => element2.isocode == AlphaCodeFromnumericCode2.get(d.id))
                    const item2vac = itemvac.find(element2 => (element2.date.split("-")[0] + "-" + element2.date.split("-")[1]) == formatDateVac(date))
                    if (item2vac) return colorScaleVaccin(item2vac.vaccination)
                }
                return "#000"
            });
        }


    })

})
d3.select(self.frameElement).style("height", "685px");
