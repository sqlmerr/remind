use crate::entities::note::NoteIconType;
use crate::errors::{CoreError, Result};
use crate::{Block, BlockDTO, BlockRepo, Note, NoteCreateDTO, NoteDTO, NoteRepo, NoteUpdateDTO};
use uuid::Uuid;

#[derive(Clone)]
pub struct NoteService<R: NoteRepo, B: BlockRepo> {
    repo: R,
    block_repo: B,
}

impl<R: NoteRepo, B: BlockRepo> NoteService<R, B> {
    pub fn new(repo: R, block_repo: B) -> Self {
        Self { repo, block_repo }
    }

    pub async fn create(&self, data: NoteCreateDTO) -> Result<NoteDTO> {
        if let Some(parent_note_id) = data.parent_note {
            let parent_note = self.repo.find_one(parent_note_id).await?;
            if parent_note.is_none() {
                return Err(CoreError::NotFound);
            }
        }

        let id = Uuid::new_v4();
        let note = Note {
            id,
            title: data.title,
            icon_type: NoteIconType::Emoji,
            icon_data: "📦".to_string(),
            workspace_id: data.workspace_id,
            parent_note: data.parent_note,
        };
        self.repo.create(note).await?;
        let dto = self.find_one(id).await?;
        Ok(dto)
    }

    pub async fn find_one(&self, id: Uuid) -> Result<NoteDTO> {
        let note = match self.repo.find_one(id).await? {
            None => return Err(CoreError::NotFound),
            Some(n) => n,
        };

        let blocks: Vec<BlockDTO> = self
            .block_repo
            .find_all_in_note(id)
            .await?
            .iter()
            .map(|b| BlockDTO::from(b.clone()))
            .collect();
        let dto = NoteDTO {
            id: note.id,
            title: note.title,
            icon_type: note.icon_type,
            icon_data: note.icon_data,
            workspace_id: note.workspace_id,
            parent_note: note.parent_note,
            blocks,
        };

        Ok(dto)
    }

    pub async fn get_all_in_workspace(&self, workspace_id: Uuid) -> Result<Vec<NoteDTO>> {
        let notes = self.repo.find_all_in_workspace(workspace_id).await?;

        let mut dtos: Vec<NoteDTO> = Vec::new();

        for note in notes {
            let blocks: Vec<BlockDTO> = self
                .block_repo
                .find_all_in_note(note.id)
                .await?
                .iter()
                .map(|b| BlockDTO::from(b.clone()))
                .collect();

            let dto = NoteDTO {
                id: note.id,
                title: note.title,
                icon_type: note.icon_type,
                icon_data: note.icon_data,
                workspace_id: note.workspace_id,
                parent_note: note.parent_note,
                blocks,
            };
            dtos.push(dto)
        }

        Ok(dtos)
    }

    pub async fn delete(&self, id: Uuid) -> Result<()> {
        self.repo.delete(id).await
    }

    pub async fn update(&self, id: Uuid, data: NoteUpdateDTO) -> Result<()> {
        let mut note = match self.repo.find_one(id).await? {
            None => return Err(CoreError::NotFound),
            Some(n) => n,
        };

        if let Some(title) = data.title {
            note.title = title;
        };

        self.repo.save(note).await
    }

    pub async fn reorder_blocks(&self, id: Uuid, blocks: Vec<Uuid>) -> Result<()> {
        let note_blocks = self.block_repo.find_all_in_note(id).await?;
        for b in note_blocks.clone() {
            if !blocks.contains(&b.id) {
                return Err(CoreError::ServerError);
            }
        }

        let mut new = Vec::new();
        for b in note_blocks {
            let position = match blocks.iter().position(|&i| i == b.id) {
                None => continue,
                Some(p) => p,
            };
            let block = Block {
                id: b.id,
                block_type: b.block_type,
                content: b.content,
                note_id: b.note_id,
                position: position as i32,
            };
            new.push(block);
        }

        for new_block in new {
            self.block_repo.save(new_block).await?;
        }

        Ok(())
    }
}
