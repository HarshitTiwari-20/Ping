#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, String, Vec, symbol_short};

#[contracttype]
#[derive(Clone)]
pub struct PollData {
    pub creator: Address,
    pub question: String,
    pub options: Vec<String>,
}

#[contracttype]
pub enum DataKey {
    PollData(u32),       // Stores the PollData struct
    PollVotes(u32),      // Stores Map<u32, u32> representing option_index -> vote count
    PollVoted(u32, Address), // bool: true if voter has voted in this poll
}

#[contract]
pub struct PingContract;

#[contractimpl]
impl PingContract {
    /// Creates a new poll with a specific 4-digit ID. Returns the ID if successful.
    pub fn create_poll(
        env: Env,
        creator: Address,
        poll_id: u32,
        question: String,
        options: Vec<String>,
    ) -> u32 {
        creator.require_auth();

        if options.len() < 2 {
            panic!("poll requires at least 2 options");
        }

        let poll_data_key = DataKey::PollData(poll_id);
        if env.storage().persistent().has(&poll_data_key) {
            panic!("poll ID already exists");
        }

        let data = PollData {
            creator: creator.clone(),
            question,
            options,
        };

        env.storage().persistent().set(&poll_data_key, &data);
        
        let initial_votes: Map<u32, u32> = Map::new(&env);
        env.storage().persistent().set(&DataKey::PollVotes(poll_id), &initial_votes);

        env.events().publish((symbol_short!("create"), poll_id), creator);
        poll_id
    }

    /// Cast a vote for a specific option in a specific poll
    pub fn vote(env: Env, voter: Address, poll_id: u32, option_index: u32) {
        voter.require_auth();

        let poll_data_key = DataKey::PollData(poll_id);
        if !env.storage().persistent().has(&poll_data_key) {
            panic!("poll does not exist");
        }

        let voted_key = DataKey::PollVoted(poll_id, voter.clone());
        if env.storage().persistent().has(&voted_key) {
            panic!("already voted in this poll");
        }

        let poll_data: PollData = env.storage().persistent().get(&poll_data_key).unwrap();
        if option_index >= poll_data.options.len() {
            panic!("invalid option index");
        }

        let mut votes: Map<u32, u32> = env
            .storage()
            .persistent()
            .get(&DataKey::PollVotes(poll_id))
            .unwrap_or(Map::new(&env));

        let current_count = votes.get(option_index).unwrap_or(0);
        votes.set(option_index, current_count + 1);

        env.storage().persistent().set(&DataKey::PollVotes(poll_id), &votes);
        env.storage().persistent().set(&voted_key, &true);

        env.events().publish((symbol_short!("vote"), poll_id, option_index), voter);
    }

    /// Retrieve poll data and votes
    pub fn get_poll(env: Env, poll_id: u32) -> (PollData, Map<u32, u32>) {
        let poll_data_key = DataKey::PollData(poll_id);
        if !env.storage().persistent().has(&poll_data_key) {
            panic!("poll does not exist");
        }

        let data: PollData = env.storage().persistent().get(&poll_data_key).unwrap();
        let votes: Map<u32, u32> = env
            .storage()
            .persistent()
            .get(&DataKey::PollVotes(poll_id))
            .unwrap();

        (data, votes)
    }

    /// Check if an address has already voted in a specific poll
    pub fn has_voted(env: Env, poll_id: u32, voter: Address) -> bool {
        env.storage().persistent().has(&DataKey::PollVoted(poll_id, voter))
    }
}

mod test;
