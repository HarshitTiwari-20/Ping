#![cfg(test)]

use super::*;
use soroban_sdk::{Env, String, Vec, testutils::Address as _};

#[test]
fn test_create_and_vote() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(PingContract, ());
    let client = PingContractClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let voter1 = Address::generate(&env);
    let voter2 = Address::generate(&env);

    let mut options = Vec::new(&env);
    options.push_back(String::from_str(&env, "Pizza"));
    options.push_back(String::from_str(&env, "Burger"));

    let poll_id = 4567;
    client.create_poll(&creator, &poll_id, &String::from_str(&env, "What to eat?"), &options);

    let (data, votes) = client.get_poll(&poll_id);
    assert_eq!(data.options.len(), 2);
    assert_eq!(votes.len(), 0);

    // Vote 1
    client.vote(&voter1, &poll_id, &0);
    assert_eq!(client.has_voted(&poll_id, &voter1), true);

    let (_, votes) = client.get_poll(&poll_id);
    assert_eq!(votes.get(0).unwrap(), 1);

    // Vote 2
    client.vote(&voter2, &poll_id, &1);
    let (_, votes) = client.get_poll(&poll_id);
    assert_eq!(votes.get(1).unwrap(), 1);
}

#[test]
#[should_panic(expected = "already voted in this poll")]
fn test_double_voting() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(PingContract, ());
    let client = PingContractClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let voter = Address::generate(&env);

    let mut options = Vec::new(&env);
    options.push_back(String::from_str(&env, "Opt 1"));
    options.push_back(String::from_str(&env, "Opt 2"));

    let poll_id = 1111;
    client.create_poll(&creator, &poll_id, &String::from_str(&env, "Q?"), &options);

    client.vote(&voter, &poll_id, &0);
    client.vote(&voter, &poll_id, &1); // Should panic
}
