//web scraper konzolna aplikacija, ki strga dano spletno mesto in grafično prikazuje vreme

var r1 = require('readline');           //omogoča uporabo konzole
var prompts = r1.createInterface(process.stdin, process.stdout);
prompts.question('Choose a year: ', function(leto)
{
    prompts.question('Choose a month: ', function(mesec)
    {
        prompts.question('Choose a station: ', function(postaja)
        {
            if (leto == null || leto == "" || mesec == null || mesec == "" || postaja == null || postaja == "")                 //če uporabnik ni vnesel nekaterih zahtevanih parametrov
            {
                console.error("Please fill in all three empty spaces!");
                process.exit();
            }

            try         //preveri, ali je parameter leto pravilno zapisan                                                                                                     
            {
                const letoInt = parseInt(leto);
                if(letoInt < 1961 || letoInt > 2021)
                {
                    console.error("Please enter a valid value for leto!");
                    process.exit();
                } 
            }
            catch(error)
            {
                console.error("Please enter a valid value for leto!");
                process.exit();
            }

            switch(mesec)                                                                                           
            {
                case "januar":
                    mesecInt = "01";
                    break;
                case "februar":
                    mesecInt = "02";
                    break;
                case "marec":
                    mesecInt = "03";
                    break;
                case "april":
                    mesecInt = "04";
                    break;
                case "maj":
                    mesecInt = "05";
                    break;
                case "junij":
                    mesecInt = "06";
                    break;
                case "julij":
                    mesecInt = "07";
                    break;
                case "avgust":
                    mesecInt = "08";
                    break;
                case "september":
                    mesecInt = "09";
                    break;
                case "oktober":
                    mesecInt = "10";
                    break;
                case "november":
                    mesecInt = "11";
                    break;
                case "december":
                    mesecInt = "12";
                    break;
                default:
                    console.error("Please enter a valid value for mesec!");
                    process.exit();
            }

            uppercasePostaja = postaja.toUpperCase().replace(/ /g, "_");        //presledke zamenjaj z _                                            

            const puppeteer = require('puppeteer');
            temperatures = new Array();
            (async () => {
                const browser = await puppeteer.launch({ headless: true, executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox']});     //configure the puppeteer
//                const browser = await puppeteer.launch({ headless: true });
                const page = await browser.newPage();
                await page.setViewport({ width: 1280, height: 800 });
                await page.goto('http://meteo.arso.gov.si/met/sl/agromet/data/month/');

                try         //v meniju combobox na spletnem mestu izberi izbrane parametre
                {
                    await page.select('select[name="leto"]', leto);
                    await page.select('select[name="mesec"]', mesecInt);
                    await page.select('select[name="postaja"]', uppercasePostaja);
                }
                catch(error)
                {
                    console.error("Please enter a valid value for postaja!");
                    process.exit();
                }

                await page.screenshot();            //dobi posnetek zaslona strani z rezultati

                try                                 //dobi vrednosti temperature (postavljene v okvir iframe na strani)
                {
                    const frame = page.frames().find(frame => frame.name() === 'data');
                    const text = await frame.$eval('pre', element => element.textContent);  

                await browser.close();

                if(text.length == 0)
                {
                    console.error("Error in retrieving information!");
                    process.exit();
                }

                splitText = text.split('\n');
                splitSplitText = new Array();
                for (let i = 4; i < splitText.length-1; i++) 
                {
                    splitSplitText.push(splitText[i].split('\t'));
                }
                for (let i = 0; i < splitSplitText.length; i++)
                {
                    temperatures.push(splitSplitText[i][5]);
                }

            //    console.log(temperatures);

                const xlabels = new Array();
                for(let i = 0; i < temperatures.length; i++)
                {
                    xlabels.push(i+1);
                }

                const ChartJSImage = require('chart.js-image');                                                     //uporabljen paket: https://www.npmjs.com/package/chart.js-image?fbclid=IwAR3bO-waEdrWd1QQAeLFNKJZud3fPV9SMYzezRGt5DiKwafe15khkNsad0Y#chart
                const line_chart = ChartJSImage().chart({
                    "type": "line",
                    "data": {
                        "labels": xlabels,
                        "datasets": [
                            {
                                "label": "Temperature Values",
                                "borderColor": "rgb(102,178,255)",
                                "backgroundColor": "rgba(255,+99,+132,+.5)",
                                "data": temperatures
                            }
                        ]
                    },
                    "options": {
                        "title": {
                            "display": true,
                            "text": "Temperatures for " + leto + " " + mesec + " " + postaja
                        },
                        "scales": {
                            "xAxes": [
                                {
                                    "scaleLabel": {
                                    "display": true,
                                    "labelString": "Day"
                                    }
                                }
                            ],
                        "yAxes": [
                            {
                                "stacked": true,
                                "scaleLabel": {
                                    "display": true,
                                    "labelString": "Value"
                                }
                            }
                        ]
                    }
                }
            }).backgroundColor('white').width(1280).height(800);
            await line_chart.toURL(); 
            await line_chart.toFile('./' + uppercasePostaja + '_' + leto + "_" + mesec +'.png');
            await line_chart.toDataURI();
            await line_chart.toBuffer();
            console.log("Successfully retrieved information!");
            process.exit();
        }
        catch (err)
        {
            console.error("Error in retrieving the information!");
            process.exit();
        }
            })();
        });
    });
});