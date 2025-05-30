use serde::{Deserialize, Serialize};
use sqlx::Row;
use sqlx::types::Json;
use uuid::Uuid;

#[derive(Clone, Debug, sqlx::Type, PartialEq, Deserialize, Serialize)]
#[sqlx(type_name = "block_type", rename_all = "PascalCase")]
pub enum BlockType {
    PlainText,
    Checkbox,
    Image,
    Code,
}

impl BlockType {
    pub fn as_str(&self) -> &'static str {
        match self {
            BlockType::PlainText => "PlainText",
            BlockType::Checkbox => "Checkbox",
            BlockType::Image => "Image",
            BlockType::Code => "Code",
        }
    }

    pub fn is_matching_content_type(&self, content: &BlockContent) -> bool {
        self.as_str() == content.as_str()
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct PlainTextContent {
    pub text: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CheckboxContent {
    pub text: String,
    pub status: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct ImageContent {
    pub url: String,
    pub alt: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CodeContent {
    pub code: String,
    pub language: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(untagged)]
pub enum BlockContent {
    PlainText(PlainTextContent),
    Checkbox(CheckboxContent),
    Image(ImageContent),
    Code(CodeContent),
}

impl BlockContent {
    pub fn as_str(&self) -> &'static str {
        match self {
            BlockContent::PlainText(_) => "PlainText",
            BlockContent::Checkbox(_) => "Checkbox",
            BlockContent::Image(_) => "Image",
            BlockContent::Code(_) => "Code",
        }
    }
}

#[derive(Clone, Debug)]
pub struct Block {
    pub id: Uuid,
    pub block_type: BlockType,
    pub content: BlockContent,
    pub note_id: Uuid,
    pub position: i32,
}

impl<'r> sqlx::FromRow<'r, sqlx::postgres::PgRow> for Block {
    fn from_row(row: &'r sqlx::postgres::PgRow) -> Result<Self, sqlx::Error> {
        let id: Uuid = row.try_get("id")?;
        let note_id: Uuid = row.try_get("note_id")?;
        let block_type: BlockType = row.try_get("block_type")?;
        let position: i32 = row.try_get("position")?;
        let content: Json<BlockContent> = row.try_get("content")?;

        match (block_type.clone(), &content.0) {
            (BlockType::PlainText, BlockContent::PlainText(_)) => Ok(Block {
                id,
                note_id,
                block_type,
                content: content.0,
                position,
            }),
            (BlockType::Image, BlockContent::Image(_)) => Ok(Block {
                id,
                note_id,
                block_type,
                content: content.0,
                position,
            }),
            (BlockType::Code, BlockContent::Code(_)) => Ok(Block {
                id,
                note_id,
                block_type,
                content: content.0,
                position,
            }),
            (BlockType::Checkbox, BlockContent::Checkbox(_)) => Ok(Block {
                id,
                note_id,
                block_type,
                content: content.0,
                position,
            }),
            _ => Err(sqlx::Error::RowNotFound),
        }
    }
}
