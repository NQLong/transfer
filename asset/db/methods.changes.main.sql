CREATE OR REPLACE function TC_HOC_PHI_DETAIL_BULK_CREATE(config in string) return NUMBER
AS
    namHoc       NUMBER(5);
    loaiDaoTao   NVARCHAR2(10);
    bacDaoTao    NVARCHAR2(10);
    hocKy        NUMBER(2);
    namTuyenSinh NUMBER(5);
    loaiPhi      NUMBER(20);
    ngayTao      NUMBER(20);
    soTien       NUMBER(20);
    counter      NUMBER(20);
    res          NUMBER(20);
BEGIN
    --     set transaction isolation level SERIALIZABLE name 'TC_HOC_PHI_DETAIL_BULK_CREATE_TRANSACTION';
    SELECT JSON_VALUE(config, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(config, '$.loaiDaoTao') INTO loaiDaoTao FROM DUAL;
    SELECT JSON_VALUE(config, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(config, '$.namTuyenSinh') INTO namTuyenSinh FROM DUAL;
    SELECT JSON_VALUE(config, '$.loaiPhi') INTO loaiPhi FROM DUAL;
    SELECT JSON_VALUE(config, '$.ngayTao') INTO ngayTao FROM DUAL;
    SELECT JSON_VALUE(config, '$.soTien') INTO soTien FROM DUAL;
    SELECT JSON_VALUE(config, '$.bacDaoTao') INTO bacDaoTao FROM DUAL;
    SELECT count(*)
    into res
    from FW_STUDENT fs
    where fs.LOAI_HINH_DAO_TAO = loaiDaoTao
      and fs.NAM_TUYEN_SINH = namTuyenSinh
      and fs.BAC_DAO_TAO = bacDaoTao;
    FOR record IN ( SELECT fs.MSSV as "mssv"
                    from FW_STUDENT fs
                    where fs.LOAI_HINH_DAO_TAO = loaiDaoTao
                      and fs.NAM_TUYEN_SINH = namTuyenSinh
                      and fs.BAC_DAO_TAO = bacDaoTao)
        LOOP
            SELECT COUNT(*)
            into counter
            from TC_HOC_PHI_DETAIL hpd
            where hpd.NAM_HOC = namHoc
              and hpd.MSSV = record."mssv"
              and hpd.HOC_KY = hocKy
              and hpd.LOAI_PHI = loaiPhi;
            if (counter = 0) then
                SELECT COUNT(*)
                into counter
                from TC_HOC_PHI hp
                where hp.NAM_HOC = namHoc
                  and hp.MSSV = record."mssv"
                  and hp.HOC_KY = hocKy;
                if (counter = 0) then
                    insert into TC_HOC_PHI (MSSV, HOC_KY, HOC_PHI, CONG_NO, NAM_HOC, NGAY_TAO)
                    VALUES (record."mssv", hocKy, 0, 0, namHoc, ngayTao);
                end if;

                INSERT INTO TC_HOC_PHI_DETAIL (MSSV, HOC_KY, NAM_HOC, LOAI_PHI, SO_TIEN, ACTIVE, NGAY_TAO)
                VALUES (record."mssv", hocKy, namHoc, loaiPhi, soTien, 1, ngayTao);
                UPDATE TC_HOC_PHI hp
                SET hp.CONG_NO = hp.CONG_NO + soTien,
                    hp.HOC_PHI = hp.HOC_PHI + soTien
                WHERE hp.NAM_HOC = namHoc
                  and hp.MSSV = record."mssv"
                  and hp.HOC_KY = hocKy;
            else select res - 1 into res from dual;
            end if;
        END LOOP;
    commit;
    RETURN res;
end;

/
--EndMethod--