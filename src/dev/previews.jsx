import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox'
import {PaletteTree} from './palette'
import PaymentCalculator from "../DiscountCalculator";
import App from "../components/Calendar";
import NewUIArtem from "../PrintPeaksFAinal/NewUIArtem";
import {Router} from "react-router-dom";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/PaymentCalculator">
                <PaymentCalculator/>
            </ComponentPreview>
            <ComponentPreview path="/App">
                <App/>
            </ComponentPreview>
            <ComponentPreview path="/NewUIArtem">
                <Router>

                </Router>
                <NewUIArtem/>
            </ComponentPreview>
        </Previews>
    )
}

export default ComponentPreviews