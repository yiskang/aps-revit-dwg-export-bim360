/////////////////////////////////////////////////////////////////////
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

(function () {
  const ADN_RESET_MODEL_EVENT = 'adnRestModelEvent';

  class RevitViewSelectorExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
      super(viewer, options);

      this.onModelRootLoaded = this.onModelRootLoaded.bind(this);
      this.onResetModel = this.onResetModel.bind(this);
      this.onModelUnloading = this.onModelUnloading.bind(this);
    }

    onResetModel(event) {
      if (!event || !event.bubble) return;

      const bubble = event.bubble;
      const doc = bubble.getDocument();

      viewer.loadDocumentNode(doc, bubble);
    }

    onModelUnloading() {
      this.destroyUI();
    }

    onModelRootLoaded() {
      const doc = this.viewer.model.getDocumentNode().getDocument();
      if (!doc) {
        return console.error('Invalid APS Document');
      }

      const filter = {
        type: 'geometry'
      };

      const rootItem = doc.getRoot();
      const viewables = rootItem.search(filter);
      if (viewables.length === 0) {
        return console.error('APS document contains no viewables.');
      }

      this.createUI(viewables);
    }

    isCurrentModel(guid) {
      const data = this.viewer.model.getDocumentNode().data;
      return data.viewableID == guid;
    }

    createUI(viewables) {
      console.log(viewables);

      if (!viewables || viewables.length === 0) {
        return console.error('APS document contains no viewables.');
      }

      $('#viewsUnavailableMessage').addClass('hidden');
      $('#availableViews').removeClass('hidden');
      const viewBubbleTable = $('#availableViews tbody');

      for (let i = 0; i < viewables.length; i++) {
        const bubble = viewables[i];
        const data = bubble.data;
        if (data.name == data.phaseNames)
          continue;

        const trow = $('<tr/>').appendTo(viewBubbleTable);

        const checkbox = [
          '<div class="checkbox">',
          '<label>',
          '<input type="checkbox" name="viewIds[]" value="' + data.viewableID + '">',
          '</label>',
          '</div>'
        ].join("\n");

        $('<td>').append(checkbox).appendTo(trow);
        $('<td>').text(bubble.id).attr('scope', 'row').appendTo(trow);
        $('<td>').text(data.name).appendTo(trow);
        $('<td>').text(data.role).appendTo(trow);
        $('<td>').text(data.ViewSets).appendTo(trow);

        trow.attr('id', `viewable-${data.viewableID}`);
        if (this.isCurrentModel(data.viewableID)) {
          console.log('%cCurrent model', 'color: blue');
          $(trow).addClass('info');
        }


        trow.dblclick((e) => {
          this.viewer.dispatchEvent({
            type: ADN_RESET_MODEL_EVENT,
            bubble
          });

          $('tr', viewBubbleTable).removeClass('info');
          $(e.currentTarget).addClass('info');

          e.preventDefault();
          e.stopPropagation();
        });
      }
    }

    destroyUI() {
      $('#viewsUnavailableMessage').removeClass('hidden');
      // $( '#availableViews' ).addClass( 'hidden' );
      $('#availableViews tbody').empty();
    }

    load() {
      this.viewer.addEventListener(
        Autodesk.Viewing.MODEL_ADDED_EVENT,
        this.onModelRootLoaded
      );

      this.viewer.addEventListener(
        ADN_RESET_MODEL_EVENT,
        this.onResetModel
      );

      this.viewer.addEventListener(
        Autodesk.Viewing.MODEL_UNLOADED_EVENT,
        this.onModelUnloading
      );
      return true;
    }

    unload() {
      this.viewer.removeEventListener(
        Autodesk.Viewing.MODEL_ADDED_EVENT,
        this.onModelRootLoaded
      );

      this.viewer.removeEventListener(
        ADN_RESET_MODEL_EVENT,
        this.onResetModel
      );

      this.viewer.removeEventListener(
        Autodesk.Viewing.MODEL_UNLOADED_EVENT,
        this.onModelUnloading
      );

      this.destroyUI();
      return true;
    }
  }

  Autodesk.Viewing.theExtensionManager.registerExtension('Autodesk.ADN.RevitViewSelectorExtension', RevitViewSelectorExtension);
})();