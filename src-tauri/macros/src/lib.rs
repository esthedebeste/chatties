use std::{fs::File, io::Write};

mod type_to_ts;
use convert_case::{Case, Casing};
use proc_macro::TokenStream;
use quote::quote;
use syn::{ItemFn, ItemStruct};
use type_to_ts::{return_type_to_ts, type_to_ts};

static SMART_INVOKE_DECLARATIONS: &str = "../src/lib/api/smart-invoke.d.ts";
trait ToTs {
    fn to_ts(&self) -> String;
}

impl ToTs for ItemStruct {
    fn to_ts(&self) -> String {
        let name = self.ident.to_string();
        let mut fields = vec![];
        for field in &self.fields {
            if let Some(ident) = &field.ident {
                if let Some(arg) = type_to_ts(&field.ty) {
                    fields.push(format!("\t{}: {}", ident.to_string(), arg));
                }
            }
        }
        let fields = fields.join("\n");
        format!("export declare interface {name} {{\n{fields}\n}}")
    }
}

impl ToTs for ItemFn {
    fn to_ts(&self) -> String {
        let name = self.sig.ident.to_string();
        let mut args = vec![];
        for arg in &self.sig.inputs {
            if let syn::FnArg::Typed(arg) = arg {
                if let syn::Pat::Ident(ident) = &*arg.pat {
                    if let Some(arg) = type_to_ts(&arg.ty) {
                        args.push(format!(
                            "{}: {}",
                            ident.ident.to_string().to_case(Case::Camel),
                            arg
                        ));
                    }
                }
            }
        }
        let ret = return_type_to_ts(&self.sig.output).unwrap_or("void".to_owned());
        if args.len() == 0 {
            format!("export declare function invoke(id: '{name}'): Promise<{ret}>")
        } else {
            let args = args.join(", ");
            format!("export declare function invoke(id: '{name}', arguments: {{{args}}}): Promise<{ret}>")
        }
    }
}

fn add_decl(decl: String) {
    let file = File::options()
        .append(true)
        .create(true)
        .open(SMART_INVOKE_DECLARATIONS)
        .expect("failed to open smart-invoke.d.ts");
    let mut file = std::io::BufWriter::new(file);
    file.write_all(decl.as_bytes())
        .expect("failed to write to smart-invoke.d.ts");
    file.write_all(b"\n")
        .expect("failed to write to smart-invoke.d.ts");
}

#[proc_macro]
pub fn colon_3_init(tokens: TokenStream) -> TokenStream {
    File::create(SMART_INVOKE_DECLARATIONS)
        .unwrap()
        .write_all(b"// generated source file! please do not manually edit.\n")
        .unwrap();
    tokens
}

#[proc_macro_attribute]
pub fn command(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let fun: ItemFn = syn::parse(item).expect("failed to parse item");
    add_decl(fun.to_ts());
    quote!(#[tauri::command] #fun).into()
}

#[proc_macro_attribute]
pub fn command_struct(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let st: ItemStruct = syn::parse(item).expect("failed to parse item");
    add_decl(st.to_ts());
    quote!(#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)] #st).into()
}

#[proc_macro_attribute]
pub fn command_struct_custom_serialization(attr: TokenStream, item: TokenStream) -> TokenStream {
    let st: ItemStruct = syn::parse(item).expect("failed to parse item");
    // command_struct_custom_serialization("export declare interface Foo { bar: string }")
    let attr: syn::LitStr = syn::parse(attr).expect("failed to parse attribute");
    add_decl(attr.value());
    quote!(#[derive(Clone, Debug)] #st).into()
}
