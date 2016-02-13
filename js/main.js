var app = angular.module('skool', []).controller('MainCtrl', function($scope) {

    init();

    var self = this;
    $scope.model = {
        suggestions:[]
    };

    function init() {
        $('.skill-slider').slider();
        $('#skill-1').slider('on', 'change', changeHandler(0));
        $('#skill-2').slider('on', 'change', changeHandler(1));
        $('#skill-3').slider('on', 'change', changeHandler(2));
        $('#skill-4').slider('on', 'change', changeHandler(3));
        $('#skill-5').slider('on', 'change', changeHandler(4));
        $('#skill-6').slider('on', 'change', changeHandler(5));
        $('#skill-7').slider('on', 'change', changeHandler(6));

        function changeHandler(id){
            return function(sliderEvt) {
                metrics.setMetric(id, sliderEvt.newValue);
                $scope.model.suggestions = suggester.suggest(metrics.getData());
                $scope.$apply();
            }
        }
    }


    var metrics = {
        data:[0,0,0,0,0,0,0],
        setMetric: function(id, value)
        {
            this.data[id] = value;
        },

        getData: function() {
            return this.data;
        }
    };

    var suggester = {
        suggest: function(data) {
            var rawData = [
                {sector:'Управління та адміністрування',speciality_id:71, speciality_name:'Облік і оподаткування',vacancy_num:3856,spros:0.06, avg_rev:5360.5, avg_rev_grow:true, people_num:31287.2727272727,skill:[80,60,40,60,80,100]},
                {sector:'Управління та адміністрування',speciality_id:72, speciality_name:'Фінанси, банківська справа та страхування',vacancy_num:3552,spros:0.05, avg_rev:6884, avg_rev_grow:true, people_num:26072.7272727273,skill:[80,40,40,80,80,100]},
                {sector:'Управління та адміністрування',speciality_id:73, speciality_name:'Менеджмент',vacancy_num:1349,spros:0.05, avg_rev:5226, avg_rev_grow:true, people_num:26072.7272727273,skill:[60,40,60,100,100,100]},
                {sector:'Управління та адміністрування',speciality_id:74, speciality_name:'Публічне управління та адміністрування',vacancy_num:1349,spros:0.05, avg_rev:5226, avg_rev_grow:true, people_num:26072.7272727273,skill:[60,60,40,80,100,100]},
                {sector:'Управління та адміністрування',speciality_id:75, speciality_name:'Маркетинг',vacancy_num:5639,spros:0.11, avg_rev:6510, avg_rev_grow:false, people_num:57360,skill:[40,60,80,100,80,100]},
                {sector:'Управління та адміністрування',speciality_id:76, speciality_name:'Підприємництво, торгівля та біржова діяльність',vacancy_num:31072,spros:0.23, avg_rev:5060.2, avg_rev_grow:true, people_num:119934.545454545,skill:[60,40,60,60,100,100]},
            ];

            var res = [];
            for(var i in rawData) {
                var rawDataItem = rawData[i];
                res.push({
                    sector: rawDataItem.sector,
                    speciality: rawDataItem.speciality_name,
                    score: this.calculateScore(rawDataItem.skill, data),
                    job_offers_volume: rawDataItem.vacancy_num,
                    average_revenue: rawDataItem.avg_rev,
                    job_offers_grow: rawDataItem.spros > 0,
                    average_revenue_grow: rawDataItem.avg_rev_grow,
                });
            }

            res.sort(function(a,b){return b.score - a.score;});
            return res;
        },

        calculateScore: function(metrics, specialityMetrics) {
            var score = 0;
            for(var i in metrics) {
                var metricDiff = metrics[i] - specialityMetrics[i];
                if(metricDiff > 0) {
                    score += metricDiff;
                }
            }

            return 100 - parseInt(score/7);
        }
    };
});