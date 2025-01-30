use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

// Expose the `cddl_from_src` function to JavaScript using `wasm_bindgen`.
#[wasm_bindgen]
pub fn cddl_from_src(cddl_schema: &str) -> Result<JsValue, JsValue> {
    #[cfg(target_arch = "wasm32")]
    return cddl::cddl_from_str(cddl_schema);
}
