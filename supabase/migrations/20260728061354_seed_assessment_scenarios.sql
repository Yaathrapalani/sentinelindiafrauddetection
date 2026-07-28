/*
# Sentinel India — Seed Assessment Scenarios

## Overview
Seeds 8 core assessment scenarios covering all 8 scam categories, each with
4 multiple-choice options (safe, cautious, risky, critical). These form the
shared core assessment that all participants see, ensuring comparability.

## Scenarios
1. Phishing — SMS bank verification
2. Investment — WhatsApp investment group
3. Impersonation — Fake courier delivery
4. Urgency — Fake family emergency call
5. Authority — Fake police threat
6. Social — Fake friend request on social media
7. Recovery — Fake hacking recovery service
8. Reporting — What to do after being scammed

## Metric Impact Keys
- digitalLiteracy, verificationHabit, authoritySusceptibility,
  urgencySusceptibility, trustCalibration, confidenceCalibration,
  aiScamAwareness, reportingReadiness, recoveryReadiness
Positive metrics increase with safe/cautious choices.
Negative metrics (authoritySusceptibility, urgencySusceptibility) increase
with risky/critical choices (higher = more vulnerable).
*/

-- We'll insert scenarios and their options using a DO block with CTEs
DO $$
DECLARE
  s_phishing uuid;
  s_investment uuid;
  s_impersonation uuid;
  s_urgency uuid;
  s_authority uuid;
  s_social uuid;
  s_recovery uuid;
  s_reporting uuid;
BEGIN
  -- Only seed if no scenarios exist yet
  SELECT id INTO s_phishing FROM scenarios WHERE category = 'phishing' AND is_core = true LIMIT 1;
  IF s_phishing IS NOT NULL THEN
    RAISE NOTICE 'Scenarios already seeded, skipping';
    RETURN;
  END IF;

  -- 1. PHISHING
  INSERT INTO scenarios (category, channel, title, description, voice_script, is_core, difficulty, tags, sort_order)
  VALUES (
    'phishing', 'sms',
    'Bank Account Verification Alert',
    'You receive an SMS: "Dear Customer, your bank account has been temporarily locked due to suspicious activity. Verify your details immediately to restore access: http://secure-bank-verify.in/locked"',
    'You receive a text message claiming your bank account has been temporarily locked due to suspicious activity. The message asks you to verify your details immediately by clicking a link to restore access.',
    true, 2, ARRAY['sms', 'bank', 'phishing', 'link'], 1
  ) RETURNING id INTO s_phishing;

  INSERT INTO scenario_options (scenario_id, option_text, response_type, metric_impacts, explanation, sort_order) VALUES
    (s_phishing, 'Do not click the link. Contact the bank directly using the official phone number from the bank''s website or app.', 'safe',
     '{"digitalLiteracy": 3, "verificationHabit": 3, "urgencySusceptibility": -2, "trustCalibration": 2}', 'Correct: Always verify through official channels. Never click links in unexpected messages.', 1),
    (s_phishing, 'Check if the URL looks legitimate before clicking the link.', 'cautious',
     '{"digitalLiteracy": 1, "verificationHabit": 1, "urgencySusceptibility": 0}', 'Partially correct: You are cautious but still risk visiting a phishing site. Better to go directly to the official app.', 2),
    (s_phishing, 'Click the link and enter your bank details to verify your account.', 'risky',
     '{"digitalLiteracy": -2, "verificationHabit": -3, "urgencySusceptibility": 2, "trustCalibration": -2}', 'Risky: This is a classic phishing attempt. Clicking the link and entering details would compromise your account.', 3),
    (s_phishing, 'Reply to the SMS with your account number for verification.', 'critical',
     '{"digitalLiteracy": -3, "verificationHabit": -3, "urgencySusceptibility": 3, "trustCalibration": -3}', 'Critical: Replying with account details gives scammers direct access. Never share account info via SMS.', 4);

  -- 2. INVESTMENT
  INSERT INTO scenarios (category, channel, title, description, voice_script, is_core, difficulty, tags, sort_order)
  VALUES (
    'investment', 'social',
    'WhatsApp Investment Group Invitation',
    'You are added to a WhatsApp group called "Stock Trading Tips - 500% Returns." A person named "Rajesh Sir" shares screenshots of huge profits and says: "Invest minimum 5000 rupees, guaranteed double return in 7 days. Limited spots!"',
    'You are added to a WhatsApp group called Stock Trading Tips with 500 percent returns. A person named Rajesh Sir shares screenshots of huge profits and says invest minimum 5000 rupees for guaranteed double return in 7 days. Limited spots available.',
    true, 3, ARRAY['whatsapp', 'investment', 'social', 'guaranteed-returns'], 2
  ) RETURNING id INTO s_investment;

  INSERT INTO scenario_options (scenario_id, option_text, response_type, metric_impacts, explanation, sort_order) VALUES
    (s_investment, 'Leave the group immediately and report it to WhatsApp. No investment gives guaranteed returns.', 'safe',
     '{"digitalLiteracy": 3, "verificationHabit": 2, "urgencySusceptibility": -2, "aiScamAwareness": 2, "trustCalibration": 2}', 'Correct: Guaranteed returns are a hallmark of investment fraud. Leaving and reporting is the safest action.', 1),
    (s_investment, 'Stay in the group to observe but do not invest any money.', 'cautious',
     '{"digitalLiteracy": 1, "verificationHabit": 1, "urgencySusceptibility": -1}', 'Partially correct: Observing is less risky but staying in scam groups normalizes the content. Better to leave and report.', 2),
    (s_investment, 'Invest 5000 rupees to test if the returns are real.', 'risky',
     '{"digitalLiteracy": -2, "verificationHabit": -2, "urgencySusceptibility": 2, "trustCalibration": -2}', 'Risky: "Testing" with real money is how scammers build trust. Initial small returns are often paid using other victims'' money.', 3),
    (s_investment, 'Invest 50,000 rupees for maximum returns before spots fill up.', 'critical',
     '{"digitalLiteracy": -3, "verificationHabit": -3, "urgencySusceptibility": 3, "trustCalibration": -3, "aiScamAwareness": -2}', 'Critical: This is a classic Ponzi scheme. You would likely lose your entire investment.', 4);

  -- 3. IMPEPERSONATION
  INSERT INTO scenarios (category, channel, title, description, voice_script, is_core, difficulty, tags, sort_order)
  VALUES (
    'impersonation', 'call',
    'Fake Courier Delivery',
    'You receive a call: "Hello, this is from BlueDart Courier. You have a parcel that could not be delivered. To reschedule, please pay a small customs fee of 25 rupees. I will send you a payment link."',
    'You receive a call from someone claiming to be from Blue Dart Courier. They say you have a parcel that could not be delivered and ask you to pay a small customs fee of 25 rupees through a payment link they will send.',
    true, 2, ARRAY['call', 'courier', 'impersonation', 'payment'], 3
  ) RETURNING id INTO s_impersonation;

  INSERT INTO scenario_options (scenario_id, option_text, response_type, metric_impacts, explanation, sort_order) VALUES
    (s_impersonation, 'Hang up. I did not order anything, so I should not be receiving parcels. If I did, I would check the official tracking app.', 'safe',
     '{"digitalLiteracy": 3, "verificationHabit": 3, "authoritySusceptibility": -2, "trustCalibration": 2}', 'Correct: Unsolicited parcel calls with payment requests are common scams. Always verify through official channels.', 1),
    (s_impersonation, 'Ask for the tracking number and verify on the official courier website.', 'cautious',
     '{"digitalLiteracy": 2, "verificationHabit": 2, "authoritySusceptibility": -1}', 'Partially correct: Verifying is good, but engaging with the caller extends the conversation. Better to hang up and check independently.', 2),
    (s_impersonation, 'Pay the 25 rupees fee through the link since it is a small amount.', 'risky',
     '{"digitalLiteracy": -2, "verificationHabit": -2, "authoritySusceptibility": 2, "trustCalibration": -2}', 'Risky: Payment links can capture your banking credentials. The small amount is bait — the real theft happens through the link.', 3),
    (s_impersonation, 'Pay the fee and also provide Aadhaar details they request for verification.', 'critical',
     '{"digitalLiteracy": -3, "verificationHabit": -3, "authoritySusceptibility": 3, "trustCalibration": -3}', 'Critical: Sharing Aadhaar details with a scammer enables identity theft. This combines financial fraud with identity fraud.', 4);

  -- 4. URGENCY
  INSERT INTO scenarios (category, channel, title, description, voice_script, is_core, difficulty, tags, sort_order)
  VALUES (
    'urgency', 'call',
    'Fake Family Emergency',
    'You receive a call at 2 AM. A voice says: "Your son has been in an accident. He needs emergency surgery. Please transfer 50,000 rupees immediately to this UPI ID: doctor@emergency. Time is critical!"',
    'You receive a call at 2 AM. A voice says your son has been in an accident and needs emergency surgery. They ask you to transfer 50,000 rupees immediately to a UPI ID. They say time is critical.',
    true, 4, ARRAY['call', 'emergency', 'family', 'urgency', 'night'], 4
  ) RETURNING id INTO s_urgency;

  INSERT INTO scenario_options (scenario_id, option_text, response_type, metric_impacts, explanation, sort_order) VALUES
    (s_urgency, 'Hang up and call my son directly on his known number. If unreachable, call other family members to verify.', 'safe',
     '{"verificationHabit": 3, "urgencySusceptibility": -3, "trustCalibration": 3, "authoritySusceptibility": -2}', 'Correct: Always verify emergency claims through independent channels. Scammers exploit panic and urgency.', 1),
    (s_urgency, 'Ask the caller for the hospital name and my son''s full name to verify.', 'cautious',
     '{"verificationHabit": 2, "urgencySusceptibility": -1, "trustCalibration": 1}', 'Partially correct: Asking for details is good, but you should still hang up and verify independently. Scammers can provide fake details.', 2),
    (s_urgency, 'Transfer the money immediately — it is an emergency and there is no time to waste.', 'risky',
     '{"verificationHabit": -3, "urgencySusceptibility": 3, "trustCalibration": -3}', 'Risky: Urgency is a manipulation tactic. Always verify before transferring money, even in emergencies.', 3),
    (s_urgency, 'Transfer the money and also share my son''s insurance details with the caller.', 'critical',
     '{"verificationHabit": -3, "urgencySusceptibility": 3, "trustCalibration": -3, "authoritySusceptibility": 2}', 'Critical: Acting without verification and sharing additional personal information compounds the damage.', 4);

  -- 5. AUTHORITY
  INSERT INTO scenarios (category, channel, title, description, voice_script, is_core, difficulty, tags, sort_order)
  VALUES (
    'authority', 'call',
    'Fake Police/Narcotics Threat',
    'You receive a call: "This is Inspector Sharma from Mumbai Police Narcotics Branch. A parcel containing illegal substances has been seized in your name. Cooperate or we will issue an arrest warrant. Transfer to a safe account for verification."',
    'You receive a call from someone claiming to be Inspector Sharma from Mumbai Police Narcotics Branch. They say a parcel containing illegal substances has been seized in your name and threaten you with an arrest warrant unless you cooperate by transferring money to a safe account for verification.',
    true, 4, ARRAY['call', 'police', 'authority', 'digital-arrest', 'narcotics'], 5
  ) RETURNING id INTO s_authority;

  INSERT INTO scenario_options (scenario_id, option_text, response_type, metric_impacts, explanation, sort_order) VALUES
    (s_authority, 'Hang up. Police do not call about warrants or ask for money transfers. Visit the local police station if concerned.', 'safe',
     '{"authoritySusceptibility": -3, "verificationHabit": 3, "trustCalibration": 3, "digitalLiteracy": 2}', 'Correct: This is a "digital arrest" scam. Real police never demand money over the phone or threaten immediate arrest.', 1),
    (s_authority, 'Ask for the officer''s badge number and the police station address, then hang up to verify.', 'cautious',
     '{"authoritySusceptibility": -1, "verificationHabit": 2, "trustCalibration": 1}', 'Partially correct: Gathering info is reasonable, but do not stay on the call. Real verification means visiting the station in person.', 2),
    (s_authority, 'Cooperate with the officer to avoid arrest and provide the requested information.', 'risky',
     '{"authoritySusceptibility": 3, "verificationHabit": -3, "trustCalibration": -3}', 'Risky: Scammers impersonate authority figures to create fear. No legitimate police procedure involves phone-based money transfer.', 3),
    (s_authority, 'Transfer money to the "safe account" as instructed and stay on the line.', 'critical',
     '{"authoritySusceptibility": 3, "verificationHabit": -3, "trustCalibration": -3, "urgencySusceptibility": 2}', 'Critical: This is the exact pattern of the "digital arrest" scam that has defrauded many Indians. Never transfer money based on a phone threat.', 4);

  -- 6. SOCIAL
  INSERT INTO scenarios (category, channel, title, description, voice_script, is_core, difficulty, tags, sort_order)
  VALUES (
    'social', 'social',
    'Fake Friend Request and Profile Cloning',
    'You receive a friend request from someone with the same name and profile picture as your friend Priya. The account has very few friends and was created recently. The "Priya" sends a message: "I lost my old account, please accept this one!"',
    'You receive a friend request from someone with the same name and profile picture as your friend Priya. The account has very few friends and was created recently. The person messages you saying they lost their old account and asks you to accept this new one.',
    true, 2, ARRAY['social', 'impersonation', 'cloning', 'friend-request'], 6
  ) RETURNING id INTO s_social;

  INSERT INTO scenario_options (scenario_id, option_text, response_type, metric_impacts, explanation, sort_order) VALUES
    (s_social, 'Do not accept. Contact Priya through another channel (call/WhatsApp) to verify if she actually created a new account.', 'safe',
     '{"verificationHabit": 3, "trustCalibration": 2, "digitalLiteracy": 2, "aiScamAwareness": 1}', 'Correct: Profile cloning is common. Always verify identity through a separate channel before accepting.', 1),
    (s_social, 'Accept the request but do not share any personal information until sure.', 'cautious',
     '{"verificationHabit": 1, "trustCalibration": 1, "digitalLiteracy": 1}', 'Partially correct: Not sharing info is good, but accepting gives the scammer access to your friend list and posts. Better to verify first.', 2),
    (s_social, 'Accept the request and start chatting since it looks like Priya.', 'risky',
     '{"verificationHabit": -2, "trustCalibration": -2, "digitalLiteracy": -1}', 'Risky: Cloned accounts are used to scam your contacts or extract personal information. The profile picture and name are easily copied.', 3),
    (s_social, 'Accept, share my phone number, and help "Priya" recover her accounts.', 'critical',
     '{"verificationHabit": -3, "trustCalibration": -3, "digitalLiteracy": -2}', 'Critical: Sharing personal information with a cloned account can lead to identity theft and further scams targeting your contacts.', 4);

  -- 7. RECOVERY
  INSERT INTO scenarios (category, channel, title, description, voice_script, is_core, difficulty, tags, sort_order)
  VALUES (
    'recovery', 'social',
    'Fake Hacking Recovery Service',
    'After being scammed, you post about it on social media. Someone messages: "I am a ethical hacker. I can recover your lost money. I have helped many people. Pay 2000 rupees as a service charge and I will start the recovery process."',
    'After being scammed, you post about it on social media. Someone messages you claiming to be an ethical hacker who can recover your lost money. They ask for 2000 rupees as a service charge to start the recovery process.',
    true, 3, ARRAY['recovery', 'secondary-scam', 'social', 'hacker'], 7
  ) RETURNING id INTO s_recovery;

  INSERT INTO scenario_options (scenario_id, option_text, response_type, metric_impacts, explanation, sort_order) VALUES
    (s_recovery, 'Do not pay. Report the cybercrime at cybercrime.gov.in or call 1930. No private hacker can recover scam money.', 'safe',
     '{"recoveryReadiness": 3, "reportingReadiness": 3, "verificationHabit": 2, "trustCalibration": 2}', 'Correct: Recovery scams target previous victims. Only official channels (1930, cybercrime.gov.in) can help. Never pay for private recovery.', 1),
    (s_recovery, 'Ask for proof of past recoveries and references before paying.', 'cautious',
     '{"recoveryReadiness": 1, "verificationHabit": 1, "trustCalibration": 0}', 'Partially correct: Asking for proof is better than paying immediately, but any "proof" can be faked. Official channels are the only safe option.', 2),
    (s_recovery, 'Pay 2000 rupees since recovering the larger lost amount is worth the risk.', 'risky',
     '{"recoveryReadiness": -2, "verificationHabit": -2, "trustCalibration": -2}', 'Risky: This is a secondary scam targeting previous victims. You would lose the 2000 rupees with no recovery.', 3),
    (s_recovery, 'Pay 2000 rupees and share all scam transaction details and bank info.', 'critical',
     '{"recoveryReadiness": -3, "verificationHabit": -3, "trustCalibration": -3}', 'Critical: Sharing transaction and bank details with a scammer enables further theft from your accounts.', 4);

  -- 8. REPORTING
  INSERT INTO scenarios (category, channel, title, description, voice_script, is_core, difficulty, tags, sort_order)
  VALUES (
    'reporting', 'app',
    'After Being Scammed — What Do You Do?',
    'You realize you have been scammed out of 15,000 rupees through a fake UPI payment. What is the first and most important action you should take?',
    'You realize you have been scammed out of 15,000 rupees through a fake UPI payment. What is the first and most important action you should take?',
    true, 1, ARRAY['reporting', 'post-scam', '1930', 'cybercrime'], 8
  ) RETURNING id INTO s_reporting;

  INSERT INTO scenario_options (scenario_id, option_text, response_type, metric_impacts, explanation, sort_order) VALUES
    (s_reporting, 'Call 1930 (National Cybercrime Helpline) immediately and file a report at cybercrime.gov.in with all transaction details.', 'safe',
     '{"reportingReadiness": 3, "recoveryReadiness": 3, "digitalLiteracy": 2}', 'Correct: Calling 1930 within the golden hour gives the best chance of freezing the fraudster''s account. File at cybercrime.gov.in.', 1),
    (s_reporting, 'Inform my bank about the fraud and ask them to reverse the transaction.', 'cautious',
     '{"reportingReadiness": 2, "recoveryReadiness": 1, "digitalLiteracy": 1}', 'Partially correct: Informing the bank is important, but calling 1930 and filing at cybercrime.gov.in is the official process with higher recovery chances.', 2),
    (s_reporting, 'Wait a few days to see if the money comes back on its own.', 'risky',
     '{"reportingReadiness": -2, "recoveryReadiness": -2}', 'Risky: Delay reduces recovery chances significantly. The first few hours are critical for freezing the fraudster''s account.', 3),
    (s_reporting, 'Keep it to myself — there is nothing that can be done after being scammed.', 'critical',
     '{"reportingReadiness": -3, "recoveryReadiness": -3}', 'Critical: Reporting is always worthwhile. Many victims recover funds, and reporting helps authorities track and stop fraud networks.', 4);
END $$;
