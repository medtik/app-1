<template>
    <!-- Fix Invalid handler when these aren't provided? -->
    <GridLayout rows="auto" columns="15*,70*,15*" :class="(bottomMargin || ios ? 'm-b-20' : '')">
        <StackLayout
            col="0"
            class="round-bkgd"
            verticalAlignment="top"
            @tap="onBack"
            v-if="canNavigateBack"
        >
            <Image width="21" src="~/images/Icon_Backarrow.png"></Image>
        </StackLayout>
        <GridLayout col="1" rows="auto,auto" columns="*">
            <Label
                row="0"
                class="title m-t-10 m-b-5 text-center"
                :text="title"
                textWrap="true"
            ></Label>
            <Label
                row="1"
                class="text-center subtitle"
                :text="subtitle"
                textWrap="true"
                :visible="subtitle"
            ></Label>
        </GridLayout>
        <StackLayout
            col="2"
            class="round-bkgd"
            @tap="onCancel"
            v-if="canCancel"
        >
            <Image width="21" src="~/images/Icon_Close.png"></Image>
        </StackLayout>
        <StackLayout
            col="2"
            class="round-bkgd"
            @tap="onSettings"
            v-if="canNavigateSettings"
        >
            <Image width="25" src="~/images/Icon_Congfigure.png"></Image>
        </StackLayout>
    </GridLayout>
</template>

<script>
import { isIOS } from "tns-core-modules/platform";

export default {
    data: () => {
        return {
            ios: isIOS
        }
    },
    props: {
        title: String,
        subtitle: {
            type: String,
            default: null
        },
        onBack: {
            type: Function,
            default: () => {}
        },
        onCancel: {
            type: Function,
            default: () => {}
        },
        onSettings: {
            type: Function,
            default: () => {}
        },
        canCancel: {
            type: Boolean,
            default: false
        },
        canNavigateBack: {
            type: Boolean,
            default: true
        },
        canNavigateSettings: {
            type: Boolean,
            default: true
        },
        bottomMargin: {
            type: Boolean,
            default: true
        }
    }
};
</script>

<style scoped lang="scss">
// Start custom common variables
@import "../app-variables";
// End custom common variables
// Custom styles
</style>
