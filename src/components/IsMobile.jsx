import { MOBILE_WIDTH } from "../components/Constants";
import { useState, useEffect } from "react";

export default () => {
    const [isMobile, setIsMobile] = useState(false);

    const resizeListener = () => {
        if (!isMobile && window.innerWidth <= MOBILE_WIDTH) {
            setIsMobile(true);
        }
        if (isMobile && window.innerWidth > MOBILE_WIDTH) {
            setIsMobile(false);
        }
    };

    useEffect(() => {
        resizeListener();
        window.addEventListener("resize", resizeListener);

        return () => window.removeEventListener("resize", resizeListener);
    }, [isMobile]);

    return isMobile;
};
