use uuid::Uuid;
use crate::{BlockDTO, BlockRepo, Note, NoteCreateDTO, NoteDTO, NoteRepo};
use crate::errors::{CoreError, Result};

#[derive(Clone)]
pub struct NoteService<R: NoteRepo, B: BlockRepo> {
    repo: R,
    block_repo: B
}

impl<R: NoteRepo, B: BlockRepo> NoteService<R, B> {
    pub fn new(repo: R, block_repo: B) -> Self {
        Self {
            repo,
            block_repo
        }
    }
    
    pub async fn create(&self, data: NoteCreateDTO) -> Result<NoteDTO> {
        let id = Uuid::new_v4();
        let note = Note {
            id,
            title: data.title,
            workspace_id: data.workspace_id
        };
        self.repo.create(note).await?;
        let dto = self.find_one(id).await?;
        Ok(dto)
    }
    
    pub async fn find_one(&self, id: Uuid) -> Result<NoteDTO> {
        let note = match self.repo.find_one(id).await? {
            None => return Err(CoreError::NotFound),
            Some(n) => n
        };

        let blocks: Vec<BlockDTO> = self.block_repo.find_all_in_note(id)
            .await?
            .iter().map(|b| {
            BlockDTO::from(b.clone())
        }).collect();
        let dto = NoteDTO {
            id: note.id,
            title: note.title,
            workspace_id: note.workspace_id,
            blocks
        };
        
        Ok(dto)
    }
    
    pub async fn get_all_in_workspace(&self, workspace_id: Uuid) -> Result<Vec<NoteDTO>> {
        let notes = self.repo.find_all_in_workspace(workspace_id)
            .await?;
        
        let mut dtos: Vec<NoteDTO> = Vec::new();
        
        for note in notes {
            let blocks: Vec<BlockDTO> = self.block_repo.find_all_in_note(note.id)
                .await?
                .iter().map(|b| {
                BlockDTO::from(b.clone())
            }).collect();

            let dto = NoteDTO {
                id: note.id,
                title: note.title,
                workspace_id: note.workspace_id,
                blocks
            };
            dtos.push(dto)
        };
        
        Ok(dtos)
    }
    
    pub async fn delete(&self, id: Uuid) -> Result<()> {
        self.repo.delete(id).await
    }
}