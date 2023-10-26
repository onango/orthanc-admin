<script>
import Modal from './Modal.vue';
import ShareModal from './ShareModal.vue';
import ModifyModal from './ModifyModal.vue';
import $ from 'jquery';
import { mapState } from 'vuex';
import api from '../orthancApi';
import resourceHelpers from '../helpers/resource-helpers';
import clipboardHelpers from '../helpers/clipboard-helpers';
import TokenLinkButton from './TokenLinkButton.vue';
import BulkLabelsModal from './BulkLabelsModal.vue';

export default {
  props: [
    'resourceOrthancId',
    'resourceDicomUid',
    'resourceLevel',
    'customClass',
    'seriesMainDicomTags',
    'studyMainDicomTags',
    'patientMainDicomTags',
    'instanceTags',
  ],
  setup() {
    return {};
  },

  data() {
    return {
      isBulkLabelModalVisible: false,
      isWsiButtonEnabled: false,
    };
  },
  watch: {},
  async mounted() {
    if (this.resourceLevel == 'series') {
      const seriesInstances = await api.getSeriesInstances(
        this.resourceOrthancId,
      );
      const firstInstancetags = await api.getSimplifiedInstanceTags(
        seriesInstances[0]['ID'],
      );
      this.isWsiButtonEnabled =
        firstInstancetags['SOPClassUID'] == '1.2.840.10008.5.1.4.1.1.77.1.6';
    }
  },
  methods: {
    toggleSubMenu(event) {
      let parent = event.target.parentElement; // TODO: find a clean way to go to next ul
      if (event.target.tagName == 'I') {
        parent = parent.parentElement;
      }
      $(parent.querySelector('.dropdown-menu')).toggle();
      event.stopPropagation();
      event.preventDefault();
    },
    deleteResource(event) {
      if (this.resourceLevel == 'bulk') {
        api.deleteResources(this.resourcesOrthancId);
        window.location.reload();
      } else {
        api
          .deleteResource(this.resourceLevel, this.resourceOrthancId)
          .then(() => {
            this.$emit('deletedResource');
          })
          .catch((reason) => {
            console.error(
              'failed to delete resource : ',
              this.resourceOrthancId,
              reason,
            );
          });
      }
    },
    getApiUrl(subRoute) {
      return api.getApiUrl(
        this.resourceLevel,
        this.resourceOrthancId,
        subRoute,
      );
    },
    async sendToDicomWebServer(server) {
      const jobId = await api.sendToDicomWebServer(
        this.resourcesOrthancId,
        server,
      );
      this.$store.dispatch('jobs/addJob', {
        jobId: jobId,
        name: 'Send to DicomWeb (' + server + ')',
      });
    },
    async sendToOrthancPeer(peer) {
      const jobId = await api.sendToOrthancPeer(this.resourcesOrthancId, peer);
      this.$store.dispatch('jobs/addJob', {
        jobId: jobId,
        name: 'Send to Peer (' + peer + ')',
      });
    },
    async sendToOrthancPeerWithTransfers(peer) {
      const jobId = await api.sendToOrthancPeerWithTransfers(
        this.resourcesForTransfer,
        peer,
      );
      this.$store.dispatch('jobs/addJob', {
        jobId: jobId,
        name: 'Transfer to Peer (' + peer + ')',
      });
    },
    async sendToDicomModality(modality) {
      const jobId = await api.sendToDicomModality(
        this.resourcesOrthancId,
        modality,
      );
      this.$store.dispatch('jobs/addJob', {
        jobId: jobId,
        name: 'Send to DICOM (' + modality + ')',
      });
    },
    capitalizeFirstLetter(level) {
      return level.charAt(0).toUpperCase() + level.slice(1);
    },
    copyIdToClipboard() {
      clipboardHelpers.copyToClipboard(this.resourceOrthancId);
    },
    getViewerIcon(forViewer) {
      const orderedViewerList = this.uiOptions.ViewersOrdering;
      const viewersIcons = this.uiOptions.ViewersIcons;

      for (const viewer of orderedViewerList) {
        if (viewer == forViewer) {
          if (this.hasOsimisViewer && forViewer == 'osimis-web-viewer') {
            return viewersIcons[viewer];
          }

          if (this.hasStoneViewer && forViewer == 'stone-webviewer') {
            return viewersIcons[viewer];
          }

          if (this.hasVolView && forViewer == 'volview') {
            return viewersIcons[viewer];
          }

          if (this.hasOhifViewer && forViewer == 'ohif') {
            return viewersIcons[viewer];
          }

          if (this.hasOhifViewer && forViewer == 'ohif-vr') {
            return viewersIcons[viewer];
          }

          if (this.hasOhifViewer && forViewer == 'ohif-tmtv') {
            return viewersIcons[viewer];
          }

          if (this.hasMedDreamViewer && forViewer == 'meddream') {
            return viewersIcons[viewer];
          }
        }
      }
      return 'bi bi-eye';
    },
    showBulkLabelModal() {
      // this modal is re-created everytime we open it (to interface correctly with bootstrap5-tags
      this.isBulkLabelModalVisible = true;
      // wait that the DOM element is created !
      setTimeout(() => {
        this.$refs['bulk-label-modal'].showModal();
      }, 50);
    },
    async onBulkModalClosed() {
      this.isBulkLabelModalVisible = false;
      await this.$store.dispatch('labels/refresh');
    },
    getOhifViewerUrl(mode) {
      if (this.resourceLevel == 'bulk') {
        const selectedStudiesDicomIds = this.selectedStudies.map(
          (s) => s['MainDicomTags']['StudyInstanceUID'],
        );
        const url = api.getOhifViewerUrlForDicomWebBulkStudies(
          mode,
          selectedStudiesDicomIds,
        );
        return url;
      } else {
        if (this.ohifDataSource == 'dicom-web') {
          return api.getOhifViewerUrlForDicomWeb(mode, this.resourceDicomUid);
        } else if (this.ohifDataSource == 'dicom-json') {
          return api.getOhifViewerUrlForDicomJson(mode, this.resourceOrthancId);
        }
      }
    },
  },
  computed: {
    ...mapState({
      uiOptions: (state) => state.configuration.uiOptions,
      ohifDataSource: (state) => state.configuration.ohifDataSource,
      installedPlugins: (state) => state.configuration.installedPlugins,
      targetDicomWebServers: (state) =>
        state.configuration.targetDicomWebServers,
      targetDicomModalities: (state) =>
        state.configuration.targetDicomModalities,
      selectedStudiesIds: (state) => state.studies.selectedStudiesIds,
      selectedStudies: (state) => state.studies.selectedStudies,
      orthancPeers: (state) => state.configuration.orthancPeers,
      tokens: (state) => state.configuration.tokens,
    }),
    componentId() {
      if (this.resourceLevel == 'bulk') {
        return 'bulk-id';
      } else {
        return this.resourceOrthancId;
      }
    },
    hasSendTo() {
      return (
        this.uiOptions.EnableSendTo &&
        (this.hasSendToDicomWeb ||
          this.hasSendToPeers ||
          this.hasSendToDicomModalities ||
          this.hasSendToPeersWithTransfer)
      );
    },
    isSendToEnabled() {
      if (this.resourceLevel == 'bulk') {
        return this.selectedStudiesIds.length > 0;
      } else {
        return true;
      }
    },
    hasLabelsButton() {
      return this.uiOptions.EnableEditLabels && this.resourceLevel == 'bulk';
    },
    isLabelsEnabled() {
      if (this.resourceLevel == 'bulk') {
        return this.selectedStudiesIds.length > 0;
      } else {
        return false;
      }
    },
    isDeleteEnabled() {
      if (this.resourceLevel == 'bulk') {
        return this.selectedStudiesIds.length > 0;
      } else {
        return true;
      }
    },
    hasWsiButton() {
      if (this.resourceLevel != 'series' || !('wsi' in this.installedPlugins)) {
        return false;
      }
      return true;
    },
    wsiViewerUrl() {
      return api.getWsiViewerUrl(this.resourceOrthancId);
    },
    hasSendToPeers() {
      return this.orthancPeers.length > 0;
    },
    hasSendToPeersWithTransfer() {
      return this.hasSendToPeers && 'transfers' in this.installedPlugins;
    },
    hasSendToDicomWeb() {
      return this.targetDicomWebServers.length > 0;
    },
    hasSendToDicomModalities() {
      return this.targetDicomModalities.length > 0;
    },
    hasOsimisViewer() {
      return 'osimis-web-viewer' in this.installedPlugins;
    },
    osimisViewerUrl() {
      return api.getOsimisViewerUrl(this.resourceLevel, this.resourceOrthancId);
    },
    hasStoneViewer() {
      return 'stone-webviewer' in this.installedPlugins;
    },
    stoneViewerUrl() {
      if (this.resourceLevel == 'bulk') {
        const selectedStudiesDicomIds = this.selectedStudies.map(
          (s) => s['MainDicomTags']['StudyInstanceUID'],
        );
        const url = api.getStoneViewerUrlForBulkStudies(
          selectedStudiesDicomIds,
        );
        return url;
      } else {
        return api.getStoneViewerUrl(this.resourceLevel, this.resourceDicomUid);
      }
    },
    hasStoneViewerButton() {
      return (
        this.hasStoneViewer &&
        (this.resourceLevel == 'study' || this.resourceLevel == 'bulk')
      );
    },
    isStoneViewerButtonEnabled() {
      return (
        this.resourceLevel == 'study' ||
        (this.resourceLevel == 'bulk' && this.selectedStudiesIds.length > 0)
      );
    },
    hasVolView() {
      return 'volview' in this.installedPlugins;
    },
    volViewUrl() {
      return api.getVolViewUrl(this.resourceLevel, this.resourceOrthancId);
    },
    hasVolViewButton() {
      return (
        this.hasVolView &&
        (this.resourceLevel == 'study' || this.resourceLevel == 'series')
      );
    },
    isVolViewButtonEnabled() {
      return this.resourceLevel == 'study' || this.resourceLevel == 'series';
    },
    hasOhifViewer() {
      return (
        this.uiOptions.EnableOpenInOhifViewer ||
        this.uiOptions.EnableOpenInOhifViewer3
      );
    },
    hasOhifViewerButton() {
      if (this.uiOptions.EnableOpenInOhifViewer3) {
        return (
          this.hasOhifViewer &&
          (this.resourceLevel == 'study' ||
            (this.resourceLevel == 'bulk' &&
              this.ohifDataSource == 'dicom-web'))
        );
      } else {
        return this.hasOhifViewer && this.resourceLevel == 'study';
      }
    },
    hasOhifViewerButtonVr() {
      if (this.uiOptions.EnableOpenInOhifViewer3) {
        return (
          this.hasOhifViewer &&
          (this.resourceLevel == 'study' ||
            (this.resourceLevel == 'bulk' &&
              this.ohifDataSource == 'dicom-web'))
        );
      } else {
        return false;
      }
    },
    hasOhifViewerButtonTmtv() {
      if (this.uiOptions.EnableOpenInOhifViewer3) {
        return this.hasOhifViewer && this.resourceLevel == 'study';
      } else {
        return false;
      }
    },
    ohifViewerUrl() {
      return this.getOhifViewerUrl('basic');
    },
    ohifViewerUrlVr() {
      return this.getOhifViewerUrl('vr');
    },
    ohifViewerUrlTmtv() {
      return this.getOhifViewerUrl('tmtv');
    },
    isOhifButtonEnabled() {
      if (this.uiOptions.EnableOpenInOhifViewer3) {
        // OHIF V3
        return (
          this.resourceLevel == 'study' ||
          (this.resourceLevel == 'bulk' && this.selectedStudiesIds.length > 0)
        );
      } else {
        // OHIF V2
        return this.resourceLevel == 'study';
      }
    },
    isOhifButtonVrEnabled() {
      if (this.uiOptions.EnableOpenInOhifViewer3) {
        // OHIF V3
        return (
          this.resourceLevel == 'study' ||
          (this.resourceLevel == 'bulk' && this.selectedStudiesIds.length > 0)
        );
      } else {
        // OHIF V2
        return false;
      }
    },
    isOhifButtonTmtvEnabled() {
      if (this.uiOptions.EnableOpenInOhifViewer3) {
        // OHIF V3
        return this.resourceLevel == 'study';
      } else {
        // OHIF V2
        return false;
      }
    },
    hasMedDreamViewer() {
      return this.uiOptions.EnableOpenInMedDreamViewer;
    },
    hasMedDreamViewerButton() {
      return (
        this.hasMedDreamViewer &&
        (this.resourceLevel == 'study' || this.resourceLevel == 'bulk')
      );
    },
    isMedDreamViewerButtonEnabled() {
      return (
        this.resourceLevel == 'study' ||
        (this.resourceLevel == 'bulk' && this.selectedStudiesIds.length > 0)
      );
    },
    medDreamViewerUrl() {
      return (
        this.uiOptions.MedDreamViewerPublicRoot +
        '?study=' +
        this.resourceDicomUid
      );
    },
    instancePreviewUrl() {
      return api.getInstancePreviewUrl(this.resourceOrthancId);
    },
    instanceDownloadUrl() {
      return api.getInstanceDownloadUrl(this.resourceOrthancId);
    },
    downloadZipUrl() {
      return api.getDownloadZipUrl(this.resourceLevel, this.resourceOrthancId);
    },
    downloadDicomDirUrl() {
      return api.getDownloadDicomDirUrl(
        this.resourceLevel,
        this.resourceOrthancId,
      );
    },
    resourceTitle() {
      return resourceHelpers.getResourceTitle(
        this.resourceLevel,
        this.patientMainDicomTags,
        this.studyMainDicomTags,
        this.seriesMainDicomTags,
        this.instanceTags,
      );
    },
    osimisViewerIcon() {
      return this.getViewerIcon('osimis-web-viewer');
    },
    stoneViewerIcon() {
      return this.getViewerIcon('stone-webviewer');
    },
    volViewIcon() {
      return this.getViewerIcon('volview');
    },
    medDreamViewerIcon() {
      return this.getViewerIcon('meddream');
    },
    ohifViewerIcon() {
      return this.getViewerIcon('ohif');
    },
    ohifViewerIconVr() {
      return this.getViewerIcon('ohif-vr');
    },
    ohifViewerIconTmtv() {
      return this.getViewerIcon('ohif-tmtv');
    },
    deleteResourceTitle() {
      const texts = {
        study: 'delete_study_title',
        series: 'delete_series_title',
        instance: 'delete_instance_title',
        bulk: 'delete_studies_title',
      };
      return texts[this.resourceLevel];
    },
    deleteResourceBody() {
      const texts = {
        study: 'delete_study_body',
        series: 'delete_series_body',
        instance: 'delete_instance_body',
        bulk: 'delete_studies_body',
      };
      return texts[this.resourceLevel];
    },
    isAnonymizationEnabled() {
      if (this.resourceLevel == 'study' || this.resourceLevel == 'series') {
        return this.uiOptions.EnableAnonymization;
      } else {
        return false;
      }
    },
    isModificationEnabled() {
      if (this.resourceLevel == 'study' || this.resourceLevel == 'series') {
        return this.uiOptions.EnableModification;
      } else {
        return false;
      }
    },
    resourcesOrthancId() {
      if (this.resourceLevel == 'bulk') {
        return this.selectedStudiesIds;
      } else {
        return [this.resourceOrthancId];
      }
    },
    resourcesForTransfer() {
      if (this.resourceLevel == 'bulk') {
        return this.selectedStudiesIds.map((id) => ({
          Level: 'Study',
          ID: id,
        }));
      } else {
        return [
          {
            Level: this.capitalizeFirstLetter(this.resourceLevel),
            ID: this.resourceOrthancId,
          },
        ];
      }
    },
    computedResourceLevel() {
      if (this.resourceLevel == 'bulk') {
        return 'study';
      } else {
        return this.resourceLevel;
      }
    },
  },
  components: {
    Modal,
    ShareModal,
    ModifyModal,
    TokenLinkButton,
    BulkLabelsModal,
  },
};
</script>

<template>
  <div>
    <div class="btn-group">
      <span v-for="viewer in uiOptions.ViewersOrdering" :key="viewer">
        <TokenLinkButton
          v-if="viewer == 'meddream' && hasMedDreamViewerButton"
          :disabled="!isMedDreamViewerButtonEnabled"
          :icon-class="medDreamViewerIcon"
          :level="computedResourceLevel"
          :link-url="medDreamViewerUrl"
          :resources-orthanc-id="resourcesOrthancId"
          :title="$t('view_in_meddream')"
          :token-type="'meddream-instant-link'"
          :opens-in-new-tab="true"
        >
        </TokenLinkButton>

        <TokenLinkButton
          v-if="
            hasOsimisViewer &&
            viewer == 'osimis-web-viewer' &&
            (resourceLevel == 'study' || resourceLevel == 'series')
          "
          :icon-class="osimisViewerIcon"
          :level="resourceLevel"
          :link-url="osimisViewerUrl"
          :resources-orthanc-id="resourcesOrthancId"
          :title="$t('view_in_osimis')"
          :token-type="'viewer-instant-link'"
          :opens-in-new-tab="true"
        >
        </TokenLinkButton>

        <TokenLinkButton
          v-if="viewer == 'stone-webviewer' && hasStoneViewerButton"
          :disabled="!isStoneViewerButtonEnabled"
          :icon-class="stoneViewerIcon"
          :level="computedResourceLevel"
          :link-url="stoneViewerUrl"
          :resources-orthanc-id="resourcesOrthancId"
          :title="$t('view_in_stone')"
          :token-type="'viewer-instant-link'"
          :opens-in-new-tab="true"
        >
        </TokenLinkButton>

        <TokenLinkButton
          v-if="viewer == 'volview' && hasVolViewButton"
          :disabled="!isVolViewButtonEnabled"
          :icon-class="volViewIcon"
          :level="computedResourceLevel"
          :link-url="volViewUrl"
          :resources-orthanc-id="resourcesOrthancId"
          :title="$t('view_in_volview')"
          :token-type="'viewer-instant-link'"
          :opens-in-new-tab="true"
        >
        </TokenLinkButton>

        <TokenLinkButton
          v-if="viewer == 'ohif' && hasOhifViewerButton"
          :disabled="!isOhifButtonEnabled"
          :icon-class="ohifViewerIcon"
          :level="computedResourceLevel"
          :link-url="ohifViewerUrl"
          :resources-orthanc-id="resourcesOrthancId"
          :title="$t('view_in_ohif')"
          :token-type="'viewer-instant-link'"
          :opens-in-new-tab="true"
        >
        </TokenLinkButton>

        <TokenLinkButton
          v-if="viewer == 'ohif-vr' && hasOhifViewerButtonVr"
          :disabled="!isOhifButtonVrEnabled"
          :icon-class="ohifViewerIconVr"
          :level="computedResourceLevel"
          :link-url="ohifViewerUrlVr"
          :resources-orthanc-id="resourcesOrthancId"
          :title="$t('view_in_ohif_vr')"
          :token-type="'viewer-instant-link'"
          :opens-in-new-tab="true"
        >
        </TokenLinkButton>

        <TokenLinkButton
          v-if="viewer == 'ohif-tmtv' && hasOhifViewerButtonTmtv"
          :disabled="!isOhifButtonTmtvEnabled"
          :icon-class="ohifViewerIconTmtv"
          :level="computedResourceLevel"
          :link-url="ohifViewerUrlTmtv"
          :resources-orthanc-id="resourcesOrthancId"
          :title="$t('view_in_ohif_tmtv')"
          :token-type="'viewer-instant-link'"
          :opens-in-new-tab="true"
        >
        </TokenLinkButton>
      </span>
      <TokenLinkButton
        v-if="resourceLevel == 'instance'"
        :icon-class="'bi bi-binoculars'"
        :level="resourceLevel"
        :link-url="instancePreviewUrl"
        :resources-orthanc-id="[resourceOrthancId]"
        :title="$t('preview')"
        :token-type="'download-instant-link'"
        :opens-in-new-tab="true"
      >
      </TokenLinkButton>
      <TokenLinkButton
        v-if="hasWsiButton"
        :hidden="!isWsiButtonEnabled"
        :icon-class="'fa-solid fa-microscope fa-button'"
        :level="resourceLevel"
        :link-url="wsiViewerUrl"
        :resources-orthanc-id="resourcesOrthancId"
        :title="$t('view_in_wsi_viewer')"
        :token-type="'viewer-instant-link'"
        :opens-in-new-tab="true"
      >
      </TokenLinkButton>
    </div>
    <div v-if="resourceLevel != 'bulk'" class="btn-group">
      <TokenLinkButton
        v-if="uiOptions.EnableDownloadZip && resourceLevel != 'instance'"
        :icon-class="'bi bi-download'"
        :level="resourceLevel"
        :link-url="downloadZipUrl"
        :resources-orthanc-id="[resourceOrthancId]"
        :title="$t('download_zip')"
        :token-type="'download-instant-link'"
      >
      </TokenLinkButton>
      <TokenLinkButton
        v-if="uiOptions.EnableDownloadDicomDir && resourceLevel != 'instance'"
        :icon-class="'bi bi-box-arrow-down'"
        :level="resourceLevel"
        :link-url="downloadDicomDirUrl"
        :resources-orthanc-id="[resourceOrthancId]"
        :title="$t('download_dicomdir')"
        :token-type="'download-instant-link'"
      >
      </TokenLinkButton>
      <TokenLinkButton
        v-if="uiOptions.EnableDownloadDicomFile && resourceLevel == 'instance'"
        :icon-class="'bi bi-download'"
        :level="resourceLevel"
        :link-url="instanceDownloadUrl"
        :resources-orthanc-id="[resourceOrthancId]"
        :title="$t('download_dicom_file')"
        :token-type="'download-instant-link'"
      >
      </TokenLinkButton>
    </div>
    <div class="btn-group">
      <button
        v-if="uiOptions.EnableDeleteResources"
        class="btn btn-sm btn-secondary m-1"
        type="button"
        data-bs-toggle="modal"
        :data-bs-target="'#delete-modal-' + resourceOrthancId"
        :disabled="!isDeleteEnabled"
      >
        <i
          class="bi bi-trash"
          data-bs-toggle="tooltip"
          :title="$t('delete')"
        ></i>
      </button>
      <Modal
        v-if="uiOptions.EnableDeleteResources"
        :id="'delete-modal-' + resourceOrthancId"
        :header-text="$t(deleteResourceTitle) + ' ' + resourceTitle"
        :ok-text="$t('delete')"
        :cancel-text="$t('cancel')"
        :body-text="$t(deleteResourceBody)"
        @ok="deleteResource($event)"
      >
      </Modal>
    </div>
    <div v-if="resourceLevel != 'bulk'" class="btn-group">
      <button
        v-if="uiOptions.EnableShares"
        class="btn btn-sm btn-secondary m-1"
        type="button"
        data-bs-toggle="modal"
        :data-bs-target="'#share-modal-' + resourceOrthancId"
      >
        <i
          class="bi bi-share"
          data-bs-toggle="tooltip"
          :title="$t('share.button_title')"
        ></i>
      </button>
      <ShareModal
        v-if="uiOptions.EnableShares"
        :id="'share-modal-' + resourceOrthancId"
        :orthanc-id="resourceOrthancId"
        :study-main-dicom-tags="studyMainDicomTags"
        :patient-main-dicom-tags="patientMainDicomTags"
      ></ShareModal>
    </div>
    <div v-if="resourceLevel != 'bulk'" class="btn-group">
      <button
        v-if="isModificationEnabled"
        class="btn btn-sm btn-secondary m-1"
        type="button"
        data-bs-toggle="modal"
        :data-bs-target="'#modify-modal-' + resourceOrthancId"
      >
        <i
          class="bi bi-pencil"
          data-bs-toggle="tooltip"
          :title="$t('modify.modify_button_title')"
        ></i>
      </button>
      <ModifyModal
        v-if="isModificationEnabled"
        :id="'modify-modal-' + resourceOrthancId"
        :orthanc-id="resourceOrthancId"
        :resource-level="resourceLevel"
        :series-main-dicom-tags="seriesMainDicomTags"
        :study-main-dicom-tags="studyMainDicomTags"
        :patient-main-dicom-tags="patientMainDicomTags"
        :is-anonymization="false"
      ></ModifyModal>
    </div>
    <div v-if="resourceLevel != 'bulk'" class="btn-group">
      <button
        v-if="isAnonymizationEnabled"
        class="btn btn-sm btn-secondary m-1"
        type="button"
        data-bs-toggle="modal"
        :data-bs-target="'#anonymize-modal-' + resourceOrthancId"
      >
        <i
          class="bi bi-person-slash"
          data-bs-toggle="tooltip"
          :title="$t('modify.anonymize_button_title')"
        ></i>
      </button>
      <ModifyModal
        v-if="isAnonymizationEnabled"
        :id="'anonymize-modal-' + resourceOrthancId"
        :orthanc-id="resourceOrthancId"
        :resource-level="resourceLevel"
        :series-main-dicom-tags="seriesMainDicomTags"
        :study-main-dicom-tags="studyMainDicomTags"
        :patient-main-dicom-tags="patientMainDicomTags"
        :is-anonymization="true"
      ></ModifyModal>
    </div>
    <div v-if="resourceLevel != 'bulk'" class="btn-group">
      <div class="dropdown">
        <button
          v-if="uiOptions.EnableApiViewMenu"
          id="apiDropdownMenuId"
          class="dropdown btn btn-sm btn-secondary m-1 dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <span data-bs-toggle="tooltip" title="API">
            <i class="bi bi-code-slash"></i>
          </span>
        </button>
        <ul
          v-if="uiOptions.EnableApiViewMenu"
          class="dropdown-menu bg-dropdown"
          aria-labelledby="apiDropdownMenuId"
        >
          >
          <li>
            <button class="dropdown-item" href="#" @click="copyIdToClipboard">
              {{ $t('copy_orthanc_id') }}
            </button>
          </li>
          <li>
            <TokenLinkButton
              :link-type="'dropdown-item'"
              :level="resourceLevel"
              :link-url="getApiUrl('')"
              :resources-orthanc-id="[resourceOrthancId]"
              :title="'/'"
              :token-type="'download-instant-link'"
              :opens-in-new-tab="true"
            >
            </TokenLinkButton>
          </li>
          <li v-if="resourceLevel == 'instance'">
            <TokenLinkButton
              :link-type="'dropdown-item'"
              :level="resourceLevel"
              :link-url="getApiUrl('/tags?simplify')"
              :resources-orthanc-id="[resourceOrthancId]"
              :title="'/tags?simplify'"
              :token-type="'download-instant-link'"
              :opens-in-new-tab="true"
            >
            </TokenLinkButton>
          </li>
          <li>
            <TokenLinkButton
              :link-type="'dropdown-item'"
              :level="resourceLevel"
              :link-url="getApiUrl('/metadata?expand')"
              :resources-orthanc-id="[resourceOrthancId]"
              :title="'/metadata?expand'"
              :token-type="'download-instant-link'"
              :opens-in-new-tab="true"
            >
            </TokenLinkButton>
          </li>
          <li>
            <TokenLinkButton
              :link-type="'dropdown-item'"
              :level="resourceLevel"
              :link-url="getApiUrl('/statistics')"
              :resources-orthanc-id="[resourceOrthancId]"
              :title="'/statistics'"
              :token-type="'download-instant-link'"
              :opens-in-new-tab="true"
            >
            </TokenLinkButton>
          </li>
          <li>
            <TokenLinkButton
              :link-type="'dropdown-item'"
              :level="resourceLevel"
              :link-url="getApiUrl('/attachments?expand')"
              :resources-orthanc-id="[resourceOrthancId]"
              :title="'/attachments?expand'"
              :token-type="'download-instant-link'"
              :opens-in-new-tab="true"
            >
            </TokenLinkButton>
          </li>
        </ul>
      </div>
    </div>
    <div v-if="resourceLevel == 'bulk'" class="btn-group">
      <!-- <button v-if="hasLabelsButton" class="btn btn-sm btn-secondary m-1" type="button"
                data-bs-toggle="modal" v-bind:data-bs-target="'#labels2-modal2-' + this.componentId" :disabled="!isLabelsEnabled">
                <i class="bi bi-tag" data-bs-toggle="tooltip" :title="$t('labels.edit_labels_button')" ></i>
            </button> -->
      <button
        v-if="hasLabelsButton"
        class="btn btn-sm btn-secondary m-1"
        type="button"
        :disabled="!isLabelsEnabled"
        @click="showBulkLabelModal()"
      >
        <i
          class="bi bi-tag"
          data-bs-toggle="tooltip"
          :title="$t('labels.edit_labels_button')"
        ></i>
      </button>
      <BulkLabelsModal
        v-if="uiOptions.EnableEditLabels && isBulkLabelModalVisible"
        :id="'labels2-modal2-' + componentId"
        ref="bulk-label-modal"
        :resource-level="resourceLevel"
        :resources-orthanc-id="selectedStudiesIds"
        @bulkModalClosed="onBulkModalClosed"
      >
      </BulkLabelsModal>
    </div>
    <div class="btn-group">
      <div class="dropdown">
        <button
          v-if="hasSendTo"
          id="sendToDropdownMenuId"
          class="dropdown btn btn-sm btn-secondary m-1 dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          :disabled="!isSendToEnabled"
        >
          >
          <span data-bs-toggle="tooltip" :title="$t('send_to.button_title')">
            <i class="bi bi-send"></i>
          </span>
        </button>
        <ul
          v-if="hasSendTo"
          class="dropdown-menu bg-dropdown"
          aria-labelledby="sendToDropdownMenuId"
        >
          <li v-if="hasSendToPeers" class="dropdown-submenu">
            <a class="dropdown-item" href="#" @click="toggleSubMenu">
              {{ $t('send_to.orthanc_peer') }}
              <i class="bi bi-caret-down"></i>
            </a>
            <ul class="dropdown-menu bg-dropdown">
              <li v-for="peer in orthancPeers" :key="peer">
                <a class="dropdown-item" @click="sendToOrthancPeer(peer)">{{
                  peer
                }}</a>
              </li>
            </ul>
          </li>
          <li v-if="hasSendToPeersWithTransfer" class="dropdown-submenu">
            <a class="dropdown-item" href="#" @click="toggleSubMenu">
              {{ $t('send_to.transfers') }}
              <i class="bi bi-caret-down"></i>
            </a>
            <ul class="dropdown-menu bg-dropdown">
              <li v-for="peer in orthancPeers" :key="peer">
                <a
                  class="dropdown-item"
                  @click="sendToOrthancPeerWithTransfers(peer)"
                  >{{ peer }}</a
                >
              </li>
            </ul>
          </li>
          <li v-if="hasSendToDicomWeb" class="dropdown-submenu">
            <a class="dropdown-item" href="#" @click="toggleSubMenu">
              {{ $t('send_to.dicom_web') }}
              <i class="bi bi-caret-down"></i>
            </a>
            <ul class="dropdown-menu bg-dropdown">
              <li v-for="dwServer in targetDicomWebServers" :key="dwServer">
                <a
                  class="dropdown-item"
                  @click="sendToDicomWebServer(dwServer)"
                  >{{ dwServer }}</a
                >
              </li>
            </ul>
          </li>
          <li v-if="hasSendToDicomModalities" class="dropdown-submenu">
            <a class="dropdown-item" href="#" @click="toggleSubMenu">
              {{ $t('send_to.dicom') }}
              <i class="bi bi-caret-down"></i>
            </a>
            <ul class="dropdown-menu bg-dropdown">
              <li v-for="modality in targetDicomModalities" :key="modality">
                <a
                  class="dropdown-item"
                  @click="sendToDicomModality(modality)"
                  >{{ modality }}</a
                >
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style>
.bg-dropdown {
  background-color: rgb(220, 220, 220);
}

.dropdown-submenu {
  position: relative;
}

.dropdown-submenu .dropdown-menu {
  top: 0;
  right: 100%;
  margin-top: -1px;
}

.fa-button {
  line-height: 1.5;
}
</style>
