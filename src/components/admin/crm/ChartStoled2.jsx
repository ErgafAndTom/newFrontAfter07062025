import React, { useState, useEffect } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const ChartStoled2 = () => {

    let data = [{
        "date": new Date(2020, 0, 1).getTime(),
        "observed": 0
    }, {
        "date": new Date(2020, 1, 1).getTime(),
        "observed": 4000
    }, {
        "date": new Date(2020, 2, 1).getTime(),
        "observed": 55000
    }, {
        "date": new Date(2020, 3, 1).getTime(),
        "observed": 220000
    }, {
        "date": new Date(2020, 4, 1).getTime(),
        "observed": 390000
    }, {
        "date": new Date(2020, 5, 1).getTime(),
        "observed": 550000
    }, {
        "date": new Date(2020, 6, 1).getTime(),
        "observed": 720000,
        "easing": 720000,
        "projection": 720000,
        "stricter": 720000
    }, {
        "date": new Date(2020, 7, 1).getTime(),
        "easing": 900000,
        "projection": 900000,
        "stricter": 900000
    }, {
        "date": new Date(2020, 8, 1).getTime(),
        "easing": 1053000,
        "projection": 1053000,
        "stricter": 1053000
    }, {
        "date": new Date(2020, 9, 1).getTime(),
        "easing": 1252000,
        "projection": 1249000,
        "stricter": 1232000
    }, {
        "date": new Date(2020, 10, 1).getTime(),
        "easing": 1674000,
        "projection": 1604000,
        "stricter": 1415000
    }, {
        "date": new Date(2020, 11, 1).getTime(),
        "easing": 3212000,
        "projection": 2342000,
        "stricter": 1751000
    }];
  let root;

  useEffect(() => {
    // Create root element
    root = am5.Root.new("chartdiv");

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    /* вставте тут решта вашого коду без 'let', присвойте всі змінні до "this",
    наприклад this.chart замість let chart */

    // для доступу до компонентів пізніше,
    // можна зберегти їх своїм властивостям this

    return () => {
      if (root) {
         // root.dispose();
          {
              data.map((item, index) => (
                  <div key={index}>
                      <span>Date: {new Date(item.date).toLocaleString()}</span>
                      <span>Observed: {item.observed}</span>
                  </div>
              ))
          }
      }
    }
  }, []);

  return <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>;

}

export default ChartStoled2;