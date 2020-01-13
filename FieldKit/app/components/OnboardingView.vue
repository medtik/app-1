<template>
    <Page class="page" actionBarHidden="true" @loaded="onPageLoaded">
        <GridLayout rows="75,*,65">
            <!-- header section -->
            <GridLayout
                row="0"
                rows="auto"
                columns="15*,70*,15*"
                class="m-y-20"
            >
                <template v-if="step > 0">
                    <StackLayout
                        col="0"
                        class="round-bkgd"
                        verticalAlignment="top"
                        @tap="goBack"
                    >
                        <Image width="21" src="~/images/Icon_Backarrow.png" />
                    </StackLayout>
                    <StackLayout col="1" verticalAlignment="middle">
                        <Label
                            class="title text-center"
                            :text="title"
                            textWrap="true"
                        ></Label>
                    </StackLayout>
                    <StackLayout col="2" />
                </template>
            </GridLayout>
            <!-- end header section -->

            <!-- assembly steps -->
            <StackLayout row="1">
                <!-- progress bar at top -->
                <GridLayout
                    order="1"
                    rows="auto"
                    columns="*"
                    class="top-line-bkgd"
                    v-if="step > 1"
                >
                    <StackLayout
                        horizontalAlignment="left"
                        :width="percentDone + '%'"
                        class="top-line"
                    ></StackLayout>
                </GridLayout>
                <!-- end progress bar -->

                <Label
                    order="2"
                    v-if="step > 0"
                    class="instruction"
                    :text="instruction"
                    textWrap="true"
                ></Label>

                <StackLayout order="3">
                    <!-- conditional list needs to be wrapped in StackLayout or else
                        error occurs about reference node has a different parent -->
                    <Gridlayout
                        rows="auto,auto,auto,auto,auto,auto"
                        columns="40*,40*"
                        class="checklist"
                        v-if="step == 1"
                    >
                        <Label
                            v-for="item in checklist"
                            :row="item.row"
                            :col="item.col"
                            :text="item.text"
                        />
                        <Label
                            row="6"
                            col="1"
                            horizontalAlignment="right"
                            class="m-t-10"
                            text="*not included"
                        />
                    </Gridlayout>
                </StackLayout>

                <Image
                    order="4"
                    v-if="displayFrame"
                    :src="displayFrame"
                    :class="step == lastStep ? 'small' : ''"
                ></Image>
            </StackLayout>
            <!-- end assembly steps section -->

            <!-- intro screen -->
            <!-- needs to be "on top of" assembly steps section -->
            <StackLayout rowSpan="3" v-if="step == 0">
                <Image
                    class="logo"
                    src="~/images/fieldkit-logo-blue.png"
                ></Image>
                <Image
                    class="illo"
                    src="~/images/FieldKit_welcome_image.jpg"
                ></Image>
                <StackLayout class="welcome-text-container">
                    <Label text="Welcome!" class="welcome text-center" />
                    <Label
                        text="Our mobile app makes it easy to set up and deploy your FieldKit station."
                        textWrap="true"
                    />
                </StackLayout>
                <Button
                    class="btn btn-primary"
                    text="Get Started"
                    @tap="goNext"
                ></Button>
                <Label
                    text="Skip instructions"
                    class="skip"
                    @tap="skip"
                    textWrap="true"
                />
            </StackLayout>
            <!-- end intro screen -->

            <!-- sticky next button -->
            <StackLayout row="2">
                <Button
                    v-if="step > 0"
                    class="btn btn-primary"
                    :text="buttonText"
                    @tap="goNext"
                ></Button>
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script>
import routes from "../routes";

export default {
    props: [],
    data() {
        return {
            step: 0,
            lastStep: steps.length - 1,
            title: "",
            instruction: "",
            buttonText: "",
            frameImage: "",
            displayFrame: null,
            percentDone: (1 / (steps.length - 1)) * 100,
            checklist: checklist
        };
    },
    components: {},
    methods: {
        onPageLoaded() {
            if (!this.animateFrameTimer) {
                this.animateFrameTimer = setInterval(this.animateFrames, 1000);
            }
        },

        goBack(event) {
            this.stopAnimation();
            // Change background color when pressed
            let cn = event.object.className;
            event.object.className = cn + " pressed";
            setTimeout(() => {
                event.object.className = cn;
            }, 500);

            if (this.step > 0) {
                this.step -= 1;
                this.title = steps[this.step].title;
                this.instruction = steps[this.step].instruction;
                this.buttonText = steps[this.step].button;
                this.percentDone = (this.step / (steps.length - 1)) * 100;
            }
            if (this.step > 0) {
                this.animateFrames();
                if (!this.animateFrameTimer) {
                    this.animateFrameTimer = setInterval(
                        this.animateFrames,
                        1000
                    );
                }
            }
        },

        goNext() {
            this.stopAnimation();
            if (this.step < steps.length - 1) {
                this.step += 1;
                this.title = steps[this.step].title;
                this.instruction = steps[this.step].instruction;
                this.buttonText = steps[this.step].button;
                this.percentDone = (this.step / (steps.length - 1)) * 100;
            } else {
                this.$navigateTo(routes.stations);
            }

            if (this.step > 0) {
                this.animateFrames();
                if (!this.animateFrameTimer) {
                    this.animateFrameTimer = setInterval(
                        this.animateFrames,
                        1000
                    );
                }
            }
        },

        skip() {
            this.stopAnimation();
            this.$navigateTo(routes.stations);
        },

        stopAnimation() {
            this.displayFrame = null;
            clearInterval(this.animateFrameTimer);
            this.animateFrameTimer = null;
        },

        animateFrames() {
            this.frameImage =
                this.frameImage == steps[this.step].images[0]
                    ? steps[this.step].images[1]
                    : steps[this.step].images[0];
            this.displayFrame = this.frameImage
                ? "~/images/" + this.frameImage
                : null;
        }
    }
};

const steps = [
    {
        // placeholder for intro screen step
        title: "",
        instruction: "",
        button: "",
        images: []
    },
    {
        title: "Do You Have Everything?",
        instruction:
            "Check that you have all of the necessary parts to assemble your FieldKit",
        button: "Assemble Station",
        images: ["TI_1-A.jpg", "TI_1-A.jpg"]
    },
    {
        title: "Assemble Station",
        instruction: "Place your core board and radio board together",
        button: "Next",
        images: ["TI_2-A.jpg", "TI_2-B.jpg"]
    },
    {
        title: "Assemble Station",
        instruction:
            "Take the combined core board and radio board and attach it to the back plane.",
        button: "Next",
        images: ["TI_3-A.jpg", "TI_3-B.jpg"]
    },
    {
        title: "Assemble Station",
        instruction:
            "Attach your individual modules to the back plane, then secure them with screws.",
        button: "Next",
        images: ["TI_4-A.jpg", "TI_4-B.jpg"]
    },
    {
        title: "Assemble Station",
        instruction:
            "Plug in your micro USB cable to charge the station battery. Once you plug it in, the station will turn on automatically.",
        button: "Next",
        images: ["TI_8-A.jpg", "TI_8-B.jpg"]
    },
    {
        title: "Assemble Station",
        instruction:
            "Now it's time to take all of your attached components and place them inside the station enclosure. Secure the system down with screws.",
        button: "Next",
        images: ["TI_5-A.jpg", "TI_5-B.jpg"]
    },
    {
        title: "Assemble Station",
        instruction:
            'Attach the battery at the top of the radio board where it says "Battery."',
        button: "Next",
        images: ["TI_6-A.jpg", "TI_6-B.jpg"]
    },
    {
        title: "Assemble Station",
        instruction:
            'Insert the button cord to the radio board into the port labeled "BTN."',
        button: "Next",
        images: ["TI_7-A.jpg", "TI_7-B.jpg"]
    },
    {
        title: "Complete",
        instruction: "Station Assembled!",
        button: "Continue",
        images: ["Icon_Success.png", "Icon_Success.png"]
    }
];

const checklist = [
    {
        row: 1,
        col: 0,
        text: "\u{2022}\u{0009} Enclosure"
    },
    {
        row: 2,
        col: 0,
        text: "\u{2022}\u{0009} Radio board"
    },
    {
        row: 3,
        col: 0,
        text: "\u{2022}\u{0009} Core board"
    },
    {
        row: 4,
        col: 0,
        text: "\u{2022}\u{0009} Back plane"
    },
    {
        row: 5,
        col: 0,
        text: "\u{2022}\u{0009} Module(s)"
    },
    {
        row: 1,
        col: 1,
        text: "\u{2022}\u{0009} 1 battery"
    },
    {
        row: 2,
        col: 1,
        text: "\u{2022}\u{0009} Screws"
    },
    {
        row: 3,
        col: 1,
        text: "\u{2022}\u{0009} Screw driver*"
    },
    {
        row: 4,
        col: 1,
        text: "\u{2022}\u{0009} Micro USB cable*"
    }
];
</script>

<style scoped lang="scss">
// Start custom common variables
@import "../app-variables";
// End custom common variables
// Custom styles

.logo {
    margin-top: 80;
    width: 225;
}
.illo {
    margin-top: 30;
    width: 285;
}
.welcome-text-container {
    width: 280;
    text-align: center;
    font-size: 15;
    margin-top: 20;
    margin-bottom: 20;
}
.welcome {
    font-weight: bold;
    font-size: 18;
}
.skip {
    width: 115;
    margin-top: 10;
    font-size: 14;
    font-weight: bold;
    text-align: center;
    padding-bottom: 3;
    border-bottom-color: $fk-gray-lighter;
    border-bottom-width: 2;
}

.top-line-bkgd {
    background-color: $fk-gray-lighter;
    margin-bottom: 40;
}
.top-line {
    border-bottom-width: 3;
    border-bottom-color: $fk-primary-blue;
}
.instruction {
    text-align: center;
    font-size: 16;
    margin-right: 20;
    margin-left: 20;
}
.checklist {
    width: 275;
    margin-top: 40;
}
.small {
    width: 50;
    margin: 20;
}
</style>