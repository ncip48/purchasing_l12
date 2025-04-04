from uuid import UUID

def uuid_to_bin(uuid_obj: UUID) -> bytes:
    return uuid_obj.bytes

def bin_to_uuid(bin_data: bytes) -> UUID:
    return UUID(bytes=bin_data)
