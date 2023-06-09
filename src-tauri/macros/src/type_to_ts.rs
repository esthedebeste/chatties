use syn::{ReturnType, Type};

pub fn type_to_ts(ty: &Type) -> Option<String> {
    macro_rules! todot {
        () => {
            panic!("type_to_ts not implemented for {:?}", ty)
        };
    }
    Some(match ty {
        Type::Path(path) => {
            let first = path.path.segments.first().unwrap();
            if first.ident == "tauri" {
                return None;
            }
            if path.path.segments.len() != 1 {
                todot!();
            }

            let str = first.ident.to_string();
            match str.as_str() {
                "Result" => {
                    if let syn::PathArguments::AngleBracketed(args) = &first.arguments {
                        if let Some(syn::GenericArgument::Type(ty)) = args.args.first() {
                            type_to_ts(ty)?
                        } else {
                            todot!()
                        }
                    } else {
                        todot!();
                    }
                }
                "Option" => {
                    if let syn::PathArguments::AngleBracketed(args) = &first.arguments {
                        if let Some(syn::GenericArgument::Type(ty)) = args.args.first() {
                            format!("{} | null", type_to_ts(ty)?)
                        } else {
                            todot!();
                        }
                    } else {
                        todot!();
                    }
                }
                "Vec" => {
                    if let syn::PathArguments::AngleBracketed(args) = &first.arguments {
                        if let Some(syn::GenericArgument::Type(ty)) = args.args.first() {
                            format!("({})[]", type_to_ts(ty)?)
                        } else {
                            todot!();
                        }
                    } else {
                        todot!();
                    }
                }
                "String" | "str" => "string".to_string(),
                "usize" | "u64" =>
                /* || more coming soon */
                {
                    "number".to_string()
                }

                "AppHandle" | "Window" => {
                    return None;
                }
                "bool" => "boolean".to_string(),
                _ => str,
            }
        }
        Type::Reference(ty) => type_to_ts(&ty.elem)?,
        Type::Tuple(ty) => {
            if ty.elems.len() > 0 {
                format!(
                    "([{}])",
                    ty.elems
                        .iter()
                        .map(|ty| type_to_ts(ty))
                        .collect::<Option<Vec<_>>>()?
                        .join(", ")
                )
            } else {
                "void".to_string()
            }
        }
        _ => todot!(),
    })
}

pub fn return_type_to_ts(ty: &ReturnType) -> Option<String> {
    if let ReturnType::Type(_, ty) = ty {
        type_to_ts(&ty)
    } else {
        Some("void".to_string())
    }
}
