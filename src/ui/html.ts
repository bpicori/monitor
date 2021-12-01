export const html = "<html>\n<head>\n    <script src=\"https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js\"></script>\n    <link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css\" rel=\"stylesheet\"\n          integrity=\"sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3\" crossorigin=\"anonymous\">\n    <link rel=\"stylesheet\" href=\"//use.fontawesome.com/releases/v5.0.7/css/all.css\">\n    <script src=\"https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js\"\n            integrity=\"sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p\"\n            crossorigin=\"anonymous\"></script>\n    <script src=\"https://code.jquery.com/jquery-3.5.1.min.js\"></script>\n</head>\n<body>\n<div class=\"container mt-5\">\n    <h3 class=\"text-center mb-5\">{{{__NAME__}}}</h3>\n\n    <div class=\"card shadow p-3 mb-5 bg-body rounded w-75 m-auto\">\n        <ul class=\"list-group list-group-flush\" id=\"monitorsList\">\n        </ul>\n    </div>\n</div>\n<script>\n    const activities = '{{{__ACTIVITIES__}}}';\n    const uiNames = {\n        lastActivities: 'Last Activities',\n        mongo: 'Mongo DB Health Check',\n        urls: 'URLs Health Check'\n    }\n    Object.keys(activities).forEach(name => {\n        const values = activities[name];\n        const generalStatus = values.find(e => !e.status)\n        $('#monitorsList').append(`\n                <li class=\"list-group-item\" id=\"${name}\">\n                 <div class=\"d-flex justify-content-between\">\n                    <h6  style=\"cursor: pointer\"><i id=\"${name}-icon\" class=\"fa fa-chevron-right\" style=\"font-size: 12px; margin-right: 6px;\"></i>\n                       ${uiNames[name] || name}\n                    </h6>\n                    <span id=\"${name}-status\" class=\"${generalStatus ? 'text-danger' : 'text-success'}\">${generalStatus ? 'ERROR' : 'OK'}</span>\n                 </div>\n                </li>\n            `)\n        if (values.length) {\n            $(`#${name}`).append(`<ul class=\"list-group list-group-flush collapse overflow-auto\" style=\"max-height: 20rem\" id=\"${name}-nestedList\">\n                   ${values.map(v => {\n                       let tooltip = \"\";\n                       if (v.lastTimeHumanize) {\n                           tooltip = v.lastTimeHumanize;\n                       }\n                       if (v.time) {\n                           tooltip = (v.time / 1000).toFixed(1) + 's';\n                       }\n                return `\n                    <li\n                        class=\"list-group-item \"\n                        style=\"border-bottom: 0;padding-left: 1.3rem;\"\n                    >\n                        <div class=\"d-flex justify-content-between\">\n                            <span >${v.name}</span>\n                            <span data-toggle=\"tooltip\" data-placement=\"top\" title=\"${tooltip}\" class=\"${v.status ? 'text-success' : 'text-danger'}\">${v.status ? 'OK' : 'ERROR'}</span>\n                        </div>\n                    </li>\n\n                   `\n            }).join('')}\n            </ul>`);\n        }\n\n        $(`#${name}`).click(function (el) {\n            $(`#${name}-icon`).toggleClass('fa-chevron-down fa-chevron-right')\n            $(`#${name}-nestedList`).toggleClass('show')\n            $(`#${name}-status`).toggle()\n        })\n    })\n\n</script>\n</body>\n</html>\n";