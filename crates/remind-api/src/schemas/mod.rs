use serde::{Serialize, Serializer};
use serde::ser::SerializeStruct;

pub mod user;
pub mod auth;
pub mod workspace;
pub mod note;
pub mod block;

pub struct DataResponseSchema<T: Serialize>(pub T);

impl<T: Serialize> Serialize for DataResponseSchema<T> {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        let mut state = serializer.serialize_struct("DataResponseSchema", 1)?;
        state.serialize_field("data", &self.0)?;
        state.end()
    }
}