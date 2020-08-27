var aqls = 0;

function upAQL() {
    aqls++;
    if (aqls == 8) {
        document.getElementById("time-value").parentElement.disabled = false;
        document.getElementById("time-value").parentElement.style.cursor = "default";
        aqls = 0;
    }
}

function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}

function createTimeApex(data, element, name, title) {
    console.log(data);
    var grouped = groupBy(data, ind => ind[name]);
    var datasets = [];
    grouped.forEach(group => {
        var max = 0;
        var dataset = { name: group[0][name], data: [] };
        for (let i = 0; i < group.length; i++) {
            max = Math.max(max, group[i]["Count"]);
            dataset.data.push({ x: new Date(group[i]["Start time"]), y: group[i]["Count"] });
        }
        dataset.data.sort((d1, d2) => d1.x - d2.x);
        //dataset.data.unshift({ date: dataset.data[0].date, value: 0 });
        dataset.max = max;
        datasets.push(dataset);
    });
    datasets.sort((d1, d2) => d1.max - d2.max);
    if (datasets.length > 10)
        datasets = datasets.slice(datasets.length - 10);
    datasets.forEach(e => delete e.max);
    document.getElementById(element).children[0].innerHTML = "";
    var options = {
        title: {
            text: title,
            align: "top",
            margin: 30,
            style: {
                fontSize: '14px',
                fontWeight: 'bold',
                fontFamily: undefined,
                color: '#263238'
            }
        },
        dataLabels: {
            enabled: false
        },
        series: datasets,
        colors: ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#3c403d', "#00ccef", "#4285f4", "#2f4858", "#9c914f", "#0f9d58"],
        chart: {
            id: 'area-datetime',
            type: 'area',
            height: 430,
            zoom: {
                autoScaleYaxis: true
            }
        },
        annotations: {
            yaxis: [{
                y: 30,
                borderColor: '#999',
                label: {
                    show: true,
                    text: 'Support',
                    style: {
                        color: "#fff",
                        background: '#00E396'
                    }
                }
            }],
            xaxis: [{
                borderColor: '#999',
                yAxisIndex: 0,
                label: {
                    show: true,
                    text: 'Rally',
                    style: {
                        color: "#fff",
                        background: '#775DD0'
                    }
                }
            }]
        },
        dataLabels: {
            enabled: false
        },
        markers: {
            size: 0,
            style: 'hollow',
        },
        xaxis: {
            type: 'datetime',
            tickAmount: 6
        },
        tooltip: {
            x: {
                format: 'dd MMM yyyy'
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.9,
                stops: [0, 100]
            }
        }
    };
    var chart = new ApexCharts(document.getElementById(element).children[0], options);
    chart.render();
    upAQL();
}

function createBar(data, element, name, text, colors) {
    if (data.length < 1) {
        var options = {
            series: [],
            labels: [],
            chart: {
                height: 390,
                type: 'pie'
            },
            title: {
                text: text,
                align: "top",
                margin: 30,
                style: {
                    fontSize: '14px',
                    fontWeight: 'bold',
                    fontFamily: undefined,
                    color: '#263238'
                }
            },
            subtitle: {
                text: "No data to show",
                align: "center",
                margin: 280,
                style: {
                    fontSize: '12px',
                    color: '#263238'
                }
            }
        };
    } else {
        data.sort((d1, d2) => d2["Count"] - d1["Count"]);
        if (data.length > 10)
            data = data.slice(data.length - 10);

        for (let i = 0; i < 10; i++)
            if (i >= data.length) {
                data[i] = { "Count": 0 };
                data[i][name] = "No Info";
            }

        document.getElementById(element).children[0].innerHTML = "";
        var options = {
            series: [{
                data: data.map(res => res["Count"])
            }],
            chart: {
                type: 'bar',
                height: 345,
                width: 300
            },
            legend: {
                horizontalAlign: 'left',
                height: 60,
                position: 'bottom',
                formatter: function(seriesName, opts) {
                    if (seriesName === "No Info")
                        return ""
                    return [seriesName]
                }
            },
            plotOptions: {
                bar: {
                    barHeight: '100%',
                    distributed: true,
                    horizontal: true,
                    dataLabels: {
                        position: 'bottom'
                    },
                }
            },
            colors: colors,
            dataLabels: {
                style: {
                    fontSize: '11px',
                    fontFamily: undefined,
                    colors: ['#263238']
                },
                enabled: true,
                textAnchor: 'start',
                formatter: function(val, opt) {
                    return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val
                },
                offsetX: 0,
                dropShadow: {
                    enabled: true
                }
            },
            stroke: {
                width: 1,
                colors: ['#fff']
            },
            xaxis: {
                categories: data.map(res => res[name])
            },
            yaxis: {
                reversed: false,
                labels: {
                    show: false
                }
            },
            title: {
                text: text,
                align: "top",
                margin: 30,
                style: {
                    fontSize: '14px',
                    fontWeight: 'bold',
                    fontFamily: undefined,
                    color: '#263238'
                }
            },
            tooltip: {
                theme: 'dark',
                x: {
                    show: false
                },
                y: {
                    title: {
                        formatter: function() {
                            return ''
                        }
                    }
                }
            }
        };
    }
    var chart = new ApexCharts(document.getElementById(element).children[0], options);
    chart.render();
    upAQL();
}

function createRadial(number, multBy, element, title) {
    document.getElementById(element).innerHTML = "";
    var options = {
        series: [number * multBy],
        colors: ['#dc3545'],
        chart: {
            height: 190,
            type: 'radialBar',
            toolbar: {
                show: true
            }
        },
        plotOptions: {
            radialBar: {
                startAngle: -90,
                endAngle: 90,
                hollow: {
                    margin: 0,
                    size: '70%',
                    background: '#fff',
                    image: undefined,
                    imageOffsetX: 0,
                    imageOffsetY: 0,
                    position: 'front',
                    dropShadow: {
                        enabled: true,
                        top: 3,
                        left: 0,
                        blur: 4,
                        opacity: 0.24
                    }
                },
                track: {
                    background: '#007bff',
                    strokeWidth: '100%',
                    margin: 0, // margin is in pixels
                    dropShadow: {
                        enabled: true,
                        top: -3,
                        left: 0,
                        blur: 4,
                        opacity: 0.35
                    }
                },

                dataLabels: {
                    show: true,
                    name: {
                        offsetY: -10,
                        show: true,
                        color: '#888',
                        fontSize: '17px'
                    },
                    value: {
                        formatter: function(val) {
                            return val / multBy;
                        },
                        color: '#111',
                        fontSize: '36px',
                        show: true,
                    }
                }
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'horizontal',
                shadeIntensity: 0.5,
                gradientToColors: ['#007bff'],
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100]
            }
        },
        stroke: {
            lineCap: 'round'
        },
        labels: [title],
    };
    var chart = new ApexCharts(document.getElementById(element), options);
    chart.render();
}

function createDonut(data, element, name, text, colors) {
    if (data.length < 1) {
        var options = {
            series: [],
            labels: [],
            chart: {
                height: 340,
                type: 'pie'
            },
            title: {
                text: text,
                align: "top",
                margin: 30,
                style: {
                    fontSize: '14px',
                    fontWeight: 'bold',
                    fontFamily: undefined,
                    color: '#263238'
                }
            },
            subtitle: {
                text: "No data to show",
                align: "center",
                margin: 280,
                style: {
                    fontSize: '12px',
                    color: '#263238'
                }
            }
        };
    } else {
        data.sort((d1, d2) => d1["Count"] - d2["Count"]);
        if (data.length > 5)
            data = data.slice(data.length - 5);

        document.getElementById(element).children[0].innerHTML = "";
        var options = {
            series: data.map(res => res["Count"]),
            chart: {
                height: 340,
                type: 'pie'
            },
            colors: colors,
            title: {
                text: text,
                align: "top",
                margin: 30,
                style: {
                    fontSize: '14px',
                    fontWeight: 'bold',
                    fontFamily: undefined,
                    color: '#263238'
                }
            },
            legend: {
                horizontalAlign: 'left',
                height: 60,
                position: 'bottom'
            },
            labels: data.map(res => res[name])
        };
    }
    var chart = new ApexCharts(document.getElementById(element).children[0], options);
    chart.render();
    upAQL();
}


function snakeToPascal(str) {
    var capped = str.split("_");
    for (str in capped)
        capped[str] = capped[str].charAt(0).toUpperCase() + capped[str].substring(1);
    return capped.join(" ");
}

function avgMagnitudes(offenses) {
    if (offenses.length == 0)
        return 0;
    sum = offenses[0]["magnitude"];
    for (offense in offenses)
        sum += offenses[offense]["magnitude"];
    return sum / offenses.length;
}

function pullOffenses(categories, element, offensesRadial, magnitudeRadial, radialFunc, failFunc) {
    var html = "<thead>\n	<tr>\n";
    for (category in categories)
        html += "		<th>\n			<span class=\"bx--table-header-label\">" + snakeToPascal(categories[category]) + "</span>\n		</th>\n";

    html += "	<th></th>\n";
    html += "	</tr>\n</thead>\n";

    html += "<tbody>\n";
    var offense_code_table = ["Source IP", "Destination IP", "Event Name",
        "Username", "Source MAC Address", "Destination MAC Address",
        "Log Source", "Hostname", "Source Port", "Destination Port", "Source IPv6",
        "Destination IPv6", "Source ASN", "Destination ASN", "Rule", "App Id", "Scheduled Search"
    ];
    $.ajax({ url: "api/offenses" })
        .done(function(res) {
            for (i in res) {
                var id = 0;
                html += "            <tr>\n";
                for (category in categories) {
                    if (categories[category] == "id")
                        id = res[i][categories[category]];
                    if (categories[category] == "start_time" || categories[category] == "last_updated_time") {
                        var date = new Date(res[i][categories[category]]);
                        html += "            	<td style=\"min-width: 125px;\">";
                        html += date.getHours().toString() + ":" + date.getMinutes().toString() + ":" + date.getSeconds().toString() + " " +
                            date.getDate().toString() + "/" + (date.getMonth() + 1).toString() + "/" + date.getFullYear().toString();
                    } else if (categories[category] == "offense_type") {
                        html += "            	<td>";
                        html += offense_code_table[parseInt(res[i][categories[category]])];
                    } else {
                        html += "            	<td>";
                        html += res[i][categories[category]];
                    }
                    html += "</td>\n";
                }
                html += "<td><a class=\"bx--content-switcher-btn view\" href=\"/console/do/sem/offensesummary?appName=Sem&pageId=OffenseSummary&summaryId=" + id + "\" target=\"_blank\">\n                            <svg width=\"2em\" height=\"2em\" viewBox=\"0 0 20 20\" fill=\"currentColor\" xmlns=\"http://www.w3.org/2000/svg\"> \
				<path fill-rule=\"evenodd\" d=\"M18 10s-3-5.5-8-5.5S2 10 2 10s3 5.5 8 5.5 8-5.5 8-5.5zM3.173 10a13.133 13.133 0 001.66 2.043C6.12 13.332 7.88 14.5 10 14.5c2.12 0 3.879-1.168 5.168-2.457A13.133 13.133 0 0016.828 10a13.133 13.133 0 00-1.66-2.043C13.879 6.668 12.119 5.5 10 5.5c-2.12 0-3.879 1.168-5.168 2.457A13.133 13.133 0 003.172 10z\" clip-rule=\"evenodd\"/> \
				<path fill-rule=\"evenodd\" d=\"M10 7.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM6.5 10a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z\" clip-rule=\"evenodd\"/> \
			  </svg>\n                        </a>\n</td>";
                html += "			 </tr>\n";
            }
            html += "</tbody>\n";
            // element.parentElement.style.overflow = "scroll";
            element.innerHTML = html;

            upAQL();
            radialFunc(res.length, 1, offensesRadial, "Open Offenses");
            upAQL();
            radialFunc(avgMagnitudes(res), 10, magnitudeRadial, "Magnitude");
            upAQL();
        })
        .fail(function(err) {
            failFunc(offensesRadial);
            failFunc(magnitudeRadial);
        });
}

function chartFail(element) {
    document.getElementById(element).innerHTML = "<h2 style=\"top: 50;\">An Error Occurred</h2>";
}


function showLoading(verySmallElements, smallElements, largeElements) {
    for (element in verySmallElements)
        document.getElementById(verySmallElements[element]).innerHTML = "<svg version=\"1.1\" id=\"L5\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"-9 2 26 26\" enable-background=\"new 0 0 0 0\" xml:space=\"preserve\"><circle fill=\"rgba(0,143,251, 0.2)\" stroke=\"none\" cx=\"1\" cy=\"10\" r=\"1\"><animateTransform attributeName=\"transform\" dur=\"1s\" type=\"translate\" values=\"0 2 ; 0 -2; 0 2\" repeatCount=\"indefinite\" begin=\"0.1\"/></circle><circle fill=\"rgba(0,143,251, 0.2)\" stroke=\"none\" cx=\"4\" cy=\"10\" r=\"1\"><animateTransform attributeName=\"transform\" dur=\"1s\" type=\"translate\" values=\"0 2 ; 0 -2; 0 2\" repeatCount=\"indefinite\" begin=\"0.2\"/></circle><circle fill=\"rgba(0,143,251, 0.2)\" stroke=\"none\" cx=\"7\" cy=\"10\" r=\"1\"><animateTransform attributeName=\"transform\" dur=\"1s\" type=\"translate\" values=\"0 2 ; 0 -2; 0 2\" repeatCount=\"indefinite\" begin=\"0.3\"/></circle>";
    for (element in smallElements)
        document.getElementById(smallElements[element]).innerHTML = "<svg version=\"1.1\" id=\"L5\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"-9 -3 26 26\" enable-background=\"new 0 0 0 0\" xml:space=\"preserve\"><circle fill=\"rgba(0,143,251, 0.2)\" stroke=\"none\" cx=\"1\" cy=\"10\" r=\"1\"><animateTransform attributeName=\"transform\" dur=\"1s\" type=\"translate\" values=\"0 2 ; 0 -2; 0 2\" repeatCount=\"indefinite\" begin=\"0.1\"/></circle><circle fill=\"rgba(0,143,251, 0.2)\" stroke=\"none\" cx=\"4\" cy=\"10\" r=\"1\"><animateTransform attributeName=\"transform\" dur=\"1s\" type=\"translate\" values=\"0 2 ; 0 -2; 0 2\" repeatCount=\"indefinite\" begin=\"0.2\"/></circle><circle fill=\"rgba(0,143,251, 0.2)\" stroke=\"none\" cx=\"7\" cy=\"10\" r=\"1\"><animateTransform attributeName=\"transform\" dur=\"1s\" type=\"translate\" values=\"0 2 ; 0 -2; 0 2\" repeatCount=\"indefinite\" begin=\"0.3\"/></circle>";
    for (element in largeElements)
        document.getElementById(largeElements[element]).innerHTML = "<svg version=\"1.1\" id=\"L5\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"-35 -6 80 80\" enable-background=\"new 0 0 0 0\" xml:space=\"preserve\"><circle fill=\"rgba(0,143,251, 0.2)\" stroke=\"none\" cx=\"1\" cy=\"10\" r=\"1\"><animateTransform attributeName=\"transform\" dur=\"1s\" type=\"translate\" values=\"0 2 ; 0 -2; 0 2\" repeatCount=\"indefinite\" begin=\"0.1\"/></circle><circle fill=\"rgba(0,143,251, 0.2)\" stroke=\"none\" cx=\"4\" cy=\"10\" r=\"1\"><animateTransform attributeName=\"transform\" dur=\"1s\" type=\"translate\" values=\"0 2 ; 0 -2; 0 2\" repeatCount=\"indefinite\" begin=\"0.2\"/></circle><circle fill=\"rgba(0,143,251, 0.2)\" stroke=\"none\" cx=\"7\" cy=\"10\" r=\"1\"><animateTransform attributeName=\"transform\" dur=\"1s\" type=\"translate\" values=\"0 2 ; 0 -2; 0 2\" repeatCount=\"indefinite\" begin=\"0.3\"/></circle>";
    //document.getElementById(elements[element]).innerHTML = "<div data-loading class=\"bx--loading\">\n		<svg class=\"bx--loading__svg\" viewBox=\"-75 -75 150 150\">\n			<title>Loading</title>\n			<circle class=\"bx--loading__stroke\" cx=\"0\" cy=\"0\" r=\"37.5\" />\n            </svg>\n</div>\n<p>Loading</p>";
}


/* Flow starters */

function pullFrom(event) {
    document.getElementById("offenses-table").parentElement.style = "";
    pull(event.target.innerText);
}

pull("15 minutes");