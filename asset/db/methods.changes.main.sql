CREATE OR REPLACE procedure hcth_cong_van_di_update_so_cong_van(
    ma in number,
    donViGui in NUMBER,
    nam in NUMBER
)
    IS
    maxThuTu           number;
    tenVietTatDonViGui STRING(100);
    loaiVanBan         STRING(10);
    loaiCongVan        STRING(10);
    postfix            STRING(200);
    counter            NUMBER(10);
    isExists           NUMBER(10);
BEGIN
    commit;
    set transaction isolation level SERIALIZABLE name 'update_so_cong_van_di';
    begin
        SELECT hcthCVD.LOAI_CONG_VAN into loaiCongVan from HCTH_CONG_VAN_DI hcthCVD WHERE hcthCVD.ID = ma;

        select MAX(SO_DI)
        into maxThuTu
        from HCTH_CONG_VAN_DI
        WHERE donViGui = DON_VI_GUI
          and (NGAY_TAO > nam)
          AND LOAI_CONG_VAN = loaiCongVan;

        SELECT dvg.TEN_VIET_TAT
        into tenVietTatDonViGui
        FROM DM_DON_VI dvg
        WHERE dvg.MA = donViGui;

        SELECT lcv.TEN_VIET_TAT
        into loaiVanBan
        FROM HCTH_CONG_VAN_DI hcthCVD
                 LEFT JOIN DM_LOAI_CONG_VAN lcv ON lcv.ID = hcthCVD.LOAI_VAN_BAN
        WHERE hcthCVD.ID = ma;
    exception
        when NO_DATA_FOUND then
            maxThuTu := 0;
    end;

    if maxThuTu is null then
        maxThuTu := 0;
    end if;
    maxThuTu := maxThuTu + 1;

    postfix := '/';
    IF loaiVanBan IS NOT NULL THEN
        postfix := postfix || loaiVanBan || '-';
    end if;

    postfix := postfix || 'XHNV';
    IF tenVietTatDonViGui IS NOT NULL THEN
        postfix := postfix || '-' || tenVietTatDonViGui;
    end if;
    counter := 2000;
    select count(*)
    into isExists
    from HCTH_CONG_VAN_DI
    WHERE donViGui = DON_VI_GUI
      and (NGAY_TAO > nam)
      AND LOAI_CONG_VAN = loaiCongVan
      AND SO_CONG_VAN = TO_CHAR(maxThuTu) || postfix;
    WHILE isExists > 0
        LOOP
            if counter = 0 then
                RAISE invalid_number;
            end if;
            select count(*)
            into isExists
            from HCTH_CONG_VAN_DI
            WHERE donViGui = DON_VI_GUI
              and (NGAY_TAO > nam)
              AND LOAI_CONG_VAN = loaiCongVan
              AND SO_CONG_VAN = TO_CHAR(maxThuTu) || postfix;

            maxThuTu := maxThuTu + 1;
            counter := counter - 1;
        END LOOP;

    update HCTH_CONG_VAN_DI hcthCVD
    set hcthCVD.SO_DI                   = maxThuTu,
        hcthCVD.TEN_VIET_TAT_DON_VI_GUI = tenVietTatDonViGui,
        hcthCVD.SO_CONG_VAN             = TO_CHAR(maxThuTu) || postfix
    WHERE hcthCVD.ID = ma;
    commit;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_STATISTIC(filter IN STRING, transactions OUT SYS_REFCURSOR
) RETURN SYS_REFCURSOR
AS
    my_cursor          SYS_REFCURSOR;
    namHoc             NUMBER(4);
    hocKy              NUMBER(1);
    tuNgay             NUMBER(20);
    denNgay            NUMBER(20);
    listBacDaoTao      NVARCHAR2(200);
    listLoaiHinhDaoTao NVARCHAR2(200);
    listKhoa           NVARCHAR2(500);
    listNganh          NVARCHAR2(500);
    nganHang           NVARCHAR2(500);

BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tuNgay') INTO tuNgay FROM DUAL;
    SELECT JSON_VALUE(filter, '$.denNgay') INTO denNgay FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listBacDaoTao') INTO listBacDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listNganh') INTO listNganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listKhoa') INTO listKhoa FROM DUAL;
    SELECT JSON_VALUE(filter, '$.nganHang') INTO nganHang FROM DUAL;

    OPEN transactions FOR
        SELECT FS.MSSV                      AS "mssv",
               FS.HO                        AS "ho",
               FS.TEN                       AS "ten",
               THPT.HOC_KY                  AS "hocKy",
               THPT.BANK                    as "nganHang",
               THPT.NAM_HOC                 AS "namHoc",
               THPT.AMOUNT                  AS "khoanDong",
               FS.MA_NGANH                  AS "maNganh",
               BDT.MA_BAC                   AS "bacDaoTao",
               NDT.TEN_NGANH                AS "tenNganh",
               DV.TEN                       AS "tenKhoa",
               LHDT.TEN                     AS "tenLoaiHinhDaoTao",
               BDT.TEN_BAC                  AS "tenBacDaoTao",
               THPT.TRANS_DATE              AS "ngayDong",
               THPT.STATUS                  AS "trangThai",
               THPTI.INVOICE_TRANSACTION_ID AS "invoiceTransactonId",
               THPTI.INVOICE_NUMBER         AS "invoiceNumber",
               THPTI.ID                     AS "invoiceID",
               THPT.TRANS_ID                AS "transactionId"
        FROM TC_HOC_PHI_TRANSACTION THPT
                 LEFT JOIN FW_STUDENT FS on THPT.CUSTOMER_ID = FS.MSSV
                 LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                 LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                 LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                 LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
                 LEFT JOIN TC_HOC_PHI_TRANSACTION_INVOICE THPTI on THPT.TRANS_ID = THPTI.TRANSACTION_ID
        where THPT.NAM_HOC = namHoc
          and THPT.HOC_KY = hocKy
          and ((tuNgay is null and denNgay is null) or
               (
                           IS_NUMERIC(THPT.TRANS_DATE) = 1
                       and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
                       and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
                   )
            )
          and THPT.STATUS = 1
          AND (listBacDaoTao IS NULL OR
               listBacDaoTao IS NOT NULL AND
               FS.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                  from dual
                                  connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
          AND (listNganh IS NULL OR
               listNganh IS NOT NULL AND FS.MA_NGANH IN (SELECT regexp_substr(listNganh, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(listNganh, '[^,]+', 1, level) is not null))
          AND (listKhoa IS NULL OR
               listKhoa IS NOT NULL AND FS.KHOA IN (SELECT regexp_substr(listKhoa, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(listKhoa, '[^,]+', 1, level) is not null))
          AND (listLoaiHinhDaoTao IS NULL OR
               listLoaiHinhDaoTao IS NOT NULL AND
               FS.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                        from dual
                                        connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
          AND (nganHang IS NULL OR
               THPT.BANK IN (SELECT regexp_substr(nganHang, '[^,]+', 1, level)
                             from dual
                             connect by regexp_substr(nganHang, '[^,]+', 1, level) is not null));


    OPEN my_cursor FOR
        SELECT HP.MSSV                  AS         "mssv",
               HP.NAM_HOC               AS         "namHoc",
               HP.HOC_KY                AS         "hocKy",
               HP.CONG_NO               AS         "congNo",
               HP.HOC_PHI               AS         "hocPhi",
               FS.HO                    as         "ho",
               FS.TEN                   AS         "ten",
               FS.GIOI_TINH             AS         "gioiTinh",
               FS.NGAY_SINH             AS         "ngaySinh",
               (FS.HO || ' ' || FS.TEN) AS         "hoTenSinhVien",
               FS.DIEN_THOAI_CA_NHAN    AS         "soDienThoai",
               FS.EMAIL_CA_NHAN         AS         "emailCaNhan",
               FS.MA_NGANH              AS         "maNganh",
               BDT.MA_BAC               AS         "bacDaoTao",
               LHDT.MA                  AS         "loaiHinhDaoTao",
               NDT.TEN_NGANH            AS         "tenNganh",
               DV.TEN                   AS         "tenKhoa",
               LHDT.TEN                 AS         "tenLoaiHinhDaoTao",
               BDT.TEN_BAC              AS         "tenBacDaoTao",
               THPT.TRANS_ID            AS         "lastTransactionId",
               THPT.TRANS_DATE          AS         "lastTransaction",
               HPI.ID                   AS         "invoiceId",
               ROW_NUMBER() OVER (ORDER BY FS.TEN) R
        FROM TC_HOC_PHI HP
                 LEFT JOIN FW_STUDENT FS
                           on HP.MSSV = FS.MSSV
                 LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                 LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                 LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                 LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
                 LEFT JOIN TC_HOC_PHI_TRANSACTION_INVOICE HPI
                           on HPI.MSSV = HP.MSSV and HPI.NAM_HOC = HP.NAM_HOC and HP.HOC_KY = HPI.HOC_KY
                 LEFT JOIN TC_HOC_PHI_TRANSACTION THPT on HP.HOC_KY = THPT.HOC_KY
            AND HP.NAM_HOC = THPT.NAM_HOC
            AND HP.MSSV = THPT.CUSTOMER_ID
            AND THPT.TRANS_DATE = (SELECT MAX(TRANS_DATE)
                                   FROM TC_HOC_PHI_TRANSACTION TRANS
                                   WHERE HP.HOC_KY = TRANS.HOC_KY
                                     AND HP.NAM_HOC = TRANS.NAM_HOC
                                     AND HP.MSSV = TRANS.CUSTOMER_ID)
        WHERE (listNganh IS NULL
            OR
               listNganh IS NOT NULL
                   AND FS.MA_NGANH IN (SELECT regexp_substr(listNganh
                                                  , '[^,]+'
                                                  , 1
                                                  , level)
                                       from dual
                                       connect by regexp_substr(listNganh
                                                      , '[^,]+'
                                                      , 1
                                                      , level) is not null))
          AND (listKhoa IS NULL
            OR
               listKhoa IS NOT NULL
                   AND FS.KHOA IN (SELECT regexp_substr(listKhoa
                                              , '[^,]+'
                                              , 1
                                              , level)
                                   from dual
                                   connect by regexp_substr(listKhoa
                                                  , '[^,]+'
                                                  , 1
                                                  , level) is not null))
          AND (listBacDaoTao IS NULL
            OR
               listBacDaoTao IS NOT NULL
                   AND
               FS.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao
                                             , '[^,]+'
                                             , 1
                                             , level)
                                  from dual
                                  connect by regexp_substr(listBacDaoTao
                                                 , '[^,]+'
                                                 , 1
                                                 , level) is not null))
          AND (listLoaiHinhDaoTao IS NULL
            OR
               listLoaiHinhDaoTao IS NOT NULL
                   AND
               FS.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao
                                                   , '[^,]+'
                                                   , 1
                                                   , level)
                                        from dual
                                        connect by regexp_substr(listLoaiHinhDaoTao
                                                       , '[^,]+'
                                                       , 1
                                                       , level) is not null))
          AND (HP.NAM_HOC = namHoc
            AND HP.HOC_KY = hocKy)
          and ((tuNgay is null and denNgay is null) or
               (
                           IS_NUMERIC(THPT.TRANS_DATE) = 1
                       and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
                       and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
                   )
            );
    RETURN my_cursor;

END ;

/
--EndMethod--

