use serde::ser::SerializeStruct;
use serde::{Serialize, Serializer};

pub mod auth;
pub mod block;
pub mod note;
pub mod user;
pub mod workspace;

pub struct DataResponseSchema<T: Serialize>(pub T);

impl<T: Serialize> Serialize for DataResponseSchema<T> {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        let mut state = serializer.serialize_struct("DataResponseSchema", 1)?;
        state.serialize_field("data", &self.0)?;
        state.end()
    }
}

#[derive(Serialize)]
pub struct OkResponseSchema {
    pub ok: bool,
}

impl OkResponseSchema {
    pub fn new(ok: bool) -> Self {
        Self { ok }
    }
}
