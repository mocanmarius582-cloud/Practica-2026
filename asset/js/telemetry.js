/**
 * UI Telemetry Engine & Performance Monitor
 * Autor: Mocan Marius | Expert RC 251
 * Data: 15.05.2026 | No-Dependency GDPR Beacon
 */

(function () {
    'use strict';

    // Inițializare obiect telemetrie
    const telemetryData = {
        appId: typeof __app_id !== 'undefined'
            ? __app_id
            : 'RC251-UTM-PORTFOLIO',

        timestamp: new Date().toISOString(),

        environment: {
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            devicePixelRatio: window.devicePixelRatio,
            hardwareConcurrency: navigator.hardwareConcurrency || 'N/A',
            deviceMemory: navigator.deviceMemory || 'N/A',
            networkType: navigator.connection
                ? navigator.connection.effectiveType
                : 'unknown'
        },

        performanceMetrics: {},

        errors: [],

        firstInputDelay: null
    };

    // =====================================================
    // PERFORMANCE METRICS
    // =====================================================

    function collectPerformanceMetrics() {

        if (!window.performance || !window.performance.getEntriesByType) {
            return;
        }

        // Navigation Timing
        const navEntries = performance.getEntriesByType('navigation');

        if (navEntries.length > 0) {

            const timing = navEntries[0];

            telemetryData.performanceMetrics.dnsTime =
                timing.domainLookupEnd - timing.domainLookupStart;

            telemetryData.performanceMetrics.tcpHandshake =
                timing.connectEnd - timing.connectStart;

            telemetryData.performanceMetrics.ttfb =
                timing.responseStart - timing.requestStart;

            telemetryData.performanceMetrics.domInteractive =
                timing.domInteractive;

            telemetryData.performanceMetrics.domComplete =
                timing.domComplete;

            telemetryData.performanceMetrics.loadEvent =
                timing.loadEventEnd - timing.startTime;
        }

        // Paint Timing
        const paintEntries = performance.getEntriesByType('paint');

        paintEntries.forEach((entry) => {

            if (entry.name === 'first-paint') {
                telemetryData.performanceMetrics.firstPaint =
                    entry.startTime.toFixed(2);
            }

            if (entry.name === 'first-contentful-paint') {
                telemetryData.performanceMetrics.firstContentfulPaint =
                    entry.startTime.toFixed(2);
            }
        });

        dispatchTelemetry();
    }

    // =====================================================
    // GLOBAL ERROR TRACKING
    // =====================================================

    window.onerror = function (
        message,
        source,
        lineno,
        colno,
        error
    ) {

        const errorObject = {
            message: message,
            source: source,
            line: lineno,
            column: colno,
            timestamp: new Date().toISOString()
        };

        telemetryData.errors.push(errorObject);

        console.error(
            "%c[Telemetry Error Captured]",
            "color:red;font-weight:bold;",
            errorObject
        );

        dispatchTelemetry();
    };

    // =====================================================
    // FIRST INPUT DELAY (FID) ESTIMATION
    // =====================================================

    function measureFID(event) {

        const fid =
            performance.now() - event.timeStamp;

        telemetryData.firstInputDelay =
            fid.toFixed(2) + " ms";

        console.log(
            "%c[FID ESTIMATION]",
            "color:orange;font-weight:bold;",
            telemetryData.firstInputDelay
        );

        dispatchTelemetry();

        window.removeEventListener('click', measureFID);
    }

    window.addEventListener(
        'click',
        measureFID,
        { once: true }
    );

    // =====================================================
    // SEND BEACON
    // =====================================================

    function dispatchTelemetry() {

        const payload =
            JSON.stringify(telemetryData);

        const endpoint =
            "https://analytics.rc251.utm.md/api/telemetry";

        console.log(
            "%c[TELEMETRIE ACTIVE] JSON:",
            "color:#00f2ff;font-weight:bold;",
            telemetryData
        );

        // sendBeacon
        if (navigator.sendBeacon) {

            navigator.sendBeacon(
                endpoint,
                payload
            );

        } else {

            // Fallback legacy browsers
            const xhr =
                new XMLHttpRequest();

            xhr.open(
                "POST",
                endpoint,
                true
            );

            xhr.setRequestHeader(
                "Content-Type",
                "application/json"
            );

            xhr.send(payload);
        }
    }

    // =====================================================
    // LIGHTHOUSE OPTIMIZATION
    // =====================================================

    function startTelemetryEngine() {

        setTimeout(
            collectPerformanceMetrics,
            500
        );
    }

    window.addEventListener('load', function () {

        // requestIdleCallback pentru scor Lighthouse mai bun
        if ('requestIdleCallback' in window) {

            requestIdleCallback(
                startTelemetryEngine
            );

        } else {

            setTimeout(
                startTelemetryEngine,
                1000
            );
        }
    });

})();