﻿/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Autodesk Developer Advocacy and Support
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

var viewer;

function launchViewer(urn) {
  var options = {
    env: 'AutodeskProduction2',
    api: 'streamingV2',
    getAccessToken: getApsToken
  };

  var config3d = {
    extensions: [
      'Autodesk.DocumentBrowser',
      'Autodesk.ADN.RevitViewSelectorExtension'
    ]
  };

  Autodesk.Viewing.Initializer(options, function () {
    if( !viewer ) {
      viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('apsViewer'), config3d);
    } else {
      viewer.impl.unloadCurrentModel();
    }

    viewer.start();

    var documentId = 'urn:' + urn;
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
  });
}

function onDocumentLoadSuccess(doc) {
  var viewables = doc.getRoot().getDefaultGeometry();
  viewer.loadDocumentNode(doc, viewables).then(i => {
    // documented loaded, any action?
  });
}

function onDocumentLoadFailure(viewerErrorCode) {
  console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function getApsToken(callback) {
    fetch('/api/aps/oauth/v1/token').then(res => {
      res.json().then(data => {
        callback(data.access_token, data.expires_in);
      });
  });
}